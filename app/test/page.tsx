import React from 'react'
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";

export default function () {
  return (
    <BentoGrid>
      <BentoCard>
        <h2 className='text-black'>Card 1</h2>
        <p>This is the content of card 1.</p>
      </BentoCard>
      
    </BentoGrid>
  )
}
