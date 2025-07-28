// app/api/process-r2-audio/route.ts
import { url } from "inspector";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { r2Key, start, duration } = body;

    // Validate payload
    if (!r2Key || start === undefined || duration === undefined) {
      return NextResponse.json(
        { message: "Missing r2Key, start, or duration in event." },
        { status: 400 }
      );
    }

    // Log for debugging
    console.log("Forwarding request to Lambda:", { r2Key, start, duration });

    // Send to your Lambda function (ใช้ URL จริงของคุณแทน)
    const lambdaResponse = await fetch(
      "https://noli8gobgh.execute-api.ap-southeast-1.amazonaws.com/default/Music_trim",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ r2Key, start, duration }),
      }
    );

    const result = await lambdaResponse.json();

    if (!lambdaResponse.ok) {
      console.error("Lambda processing failed:", result);
      return NextResponse.json(
        { message: result.message || "Lambda processing failed" },
        { status: lambdaResponse.status }
      );
    }

    return NextResponse.json({
      url : result.trimmedR2Key,
      trimmedR2Key: result.trimmedR2Key ?? r2Key,
    });
  } catch (error: any) {
    console.error("Error in Next.js API route (/api/process-r2-audio):", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
