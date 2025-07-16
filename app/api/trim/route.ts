import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { generatePresignedPutUrl, generatePresignedGetUrl } from "@/lib/r2";
import cutter from "mp3-cutter";

import fs from "fs/promises"; // ใช้ fs/promises เพื่อ asynchronous file operations
import path from "path";

export async function POST(req: NextRequest) {
  let inputFilePath: string | undefined;
  let outputFilePath: string | undefined;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const start = Number(formData.get("start")); // เวลาเริ่มต้น (วินาที)
    const duration = Number(formData.get("duration")); // ความยาวที่ต้องการตัด (วินาที)

    if (!(file instanceof File)) {
      console.error("❌ Invalid file: Not a File instance.");
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    if (isNaN(start) || start < 0 || isNaN(duration) || duration <= 0) {
      console.error(`❌ Invalid start or duration: start=${start}, duration=${duration}`);
      return NextResponse.json({ error: "Invalid start or duration" }, { status: 400 });
    }

    const tmpDir = path.join(process.cwd(), "tmp");
    // สร้างโฟลเดอร์ tmp ถ้ายังไม่มี (recursive: true จะสร้าง parent folders ด้วยถ้าไม่มี)
    await fs.mkdir(tmpDir, { recursive: true });

    inputFilePath = path.join(tmpDir, `${uuidv4()}-input.mp3`);
    outputFilePath = path.join(tmpDir, `${uuidv4()}-trimmed.mp3`);

    // --- ขั้นตอนที่ 1: เขียนไฟล์ input ลง tmp ---
    console.log("📁 Attempting to write input file to:", inputFilePath);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(inputFilePath, fileBuffer);
    console.log("✅ Input file written successfully to:", inputFilePath);

    // --- ขั้นตอนที่ 2: ตัดเสียงด้วย mp3-cutter ---
    console.log(`✂️ Cutting audio from ${start}s for ${duration}s. Input: ${inputFilePath}, Output: ${outputFilePath}`);
    await new Promise<void>((resolve, reject) => {
      cutter.cut({
        src: inputFilePath,
        target: outputFilePath,
        start: start,
        end: start + duration,
      }, (err: Error | null) => { // รับ err เป็น Error หรือ null
        if (err) {
          console.error("❌ Error cutting audio:", err.message);
          return reject(new Error("Failed to cut audio: " + err.message));
        }
        console.log("✅ Audio cut successfully.");
        resolve();
      });
    });

    // --- ขั้นตอนที่ 3: อ่านไฟล์ที่ตัดแล้วจาก tmp ---
    console.log("💾 Attempting to read trimmed file from:", outputFilePath);
    const trimmedBuffer = await fs.readFile(outputFilePath);
    console.log(`✅ Trimmed file read successfully. Size: ${trimmedBuffer.length} bytes.`);

    // --- ขั้นตอนที่ 4: อัปโหลดไปยัง R2 ---
    const objectKey = `trimmed/${uuidv4()}.mp3`;
    console.log(`☁️ Generating presigned PUT URL for object key: ${objectKey}`);
    const putUrl = await generatePresignedPutUrl(objectKey, "audio/mpeg");
    console.log("✅ Presigned PUT URL generated.");

    console.log("☁️ Attempting to upload trimmed audio to R2...");
    const uploadResponse = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "audio/mpeg",
      },
      body: trimmedBuffer,
    });

    // ตรวจสอบสถานะการอัปโหลด
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`❌ R2 upload failed with status ${uploadResponse.status}: ${errorText}`);
      throw new Error(`R2 upload failed: ${uploadResponse.status} - ${errorText}`);
    }
    console.log("✅ Trimmed audio uploaded successfully to R2.");

    // --- ขั้นตอนที่ 5: สร้าง URL สำหรับดาวน์โหลดและส่งคืน ---
    console.log(`🔗 Generating presigned GET URL for object key: ${objectKey}`);
    const getUrl = await generatePresignedGetUrl(objectKey);
    console.log("✅ Presigned GET URL generated.");

    console.log("🎉 All processes completed successfully! Final URL:", getUrl);
    return NextResponse.json({ url: getUrl }, { status: 200 });

  } catch (err) {
    console.error("❌ Uncaught error in processing:", err);
    // ลบไฟล์ชั่วคราวเสมอไม่ว่าจะสำเร็จหรือล้มเหลว
    // ใช้ try-catch แยกต่างหากเพื่อป้องกันไม่ให้การลบไฟล์ที่ล้มเหลวบดบัง error หลัก
    if (inputFilePath) {
      try {
        if (await fs.stat(inputFilePath)) { // ตรวจสอบว่าไฟล์ยังมีอยู่
          await fs.unlink(inputFilePath);
          console.log(`🧹 Cleaned up input file: ${inputFilePath}`);
        }
      } catch (cleanupErr: any) {
        if (cleanupErr.code !== 'ENOENT') { // ไม่ต้อง log ถ้าไฟล์ไม่มีอยู่แล้ว
          console.warn(`⚠️ Could not delete input file ${inputFilePath}:`, cleanupErr);
        }
      }
    }
    if (outputFilePath) {
      try {
        if (await fs.stat(outputFilePath)) { // ตรวจสอบว่าไฟล์ยังมีอยู่
          await fs.unlink(outputFilePath);
          console.log(`🧹 Cleaned up output file: ${outputFilePath}`);
        }
      } catch (cleanupErr: any) {
        if (cleanupErr.code !== 'ENOENT') { // ไม่ต้อง log ถ้าไฟล์ไม่มีอยู่แล้ว
          console.warn(`⚠️ Could not delete output file ${outputFilePath}:`, cleanupErr);
        }
      }
    }

    return NextResponse.json({ error: "Failed to process audio", details: (err as Error).message }, { status: 500 });
  }
}