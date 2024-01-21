import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
  const { question } = await request.json()

  try {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_CHATGPT_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a knowlegeable assistant that provides quality information.',
          },
          {
            role: 'user',
            content: `Tell me ${question}`,
          },
        ],
      }),
    })

    const responseData = await response.json()
    const reply = responseData.choices[0].message.content

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.log('error: ', error.message)
    return NextResponse.json({ err: error.message })
  }
}
