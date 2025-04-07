import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { ChatCompletion } from 'openai/resources/chat/completions';

// Ensure OPENAI_API_KEY is set in your environment variables

interface RequestBody {
  blogContent: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { blogContent }: RequestBody = await request.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    if (!blogContent || typeof blogContent !== 'string') {
      return NextResponse.json({ error: "Invalid blog content provided" }, { status: 400 });
    }

    console.log(`Received blog content. Length: ${blogContent.length} characters`);

    // Define the system prompt based on user's instructions
    const systemPrompt = `Create a Facebook headline and two engaging paragraphs based on the content of a provided blog.

To accomplish this, extract the most important themes, messages, or insights from the blog. Use these key points to craft a compelling headline and accompanying paragraphs that will entice a Facebook audience to read the full blog.

# Steps

1. **Read and Understand the Blog Content**: Identify the central theme or key messages of the blog. Pay attention to unique insights or interesting points that could appeal to a social media audience.

2. **Craft the Headline**: Develop a short, catchy headline that captures the essence of the blog and entices readers to learn more. The headline should be attention-grabbing and relevant to the main content.

3. **Write the Paragraphs**: Compose two paragraphs that summarize the blog content. These should highlight the most engaging points, providing enough information to interest readers without revealing everything in the blog. Use an engaging and conversational tone appropriate for Facebook.

# Output Format

Strictly follow this format for your response:
Headline: [Your generated headline here]
Paragraph 1: [Your first generated paragraph here]
Paragraph 2: [Your second generated paragraph here]

# Examples

**Example 1**

- **Blog Topic**: "10 Tips for Healthy Living"
- **Headline**: Transform Your Life with These 10 Essential Health Tips!
- **Paragraph 1**: Are you ready to embrace a healthier lifestyle? Our latest blog post dives into ten transformative tips that can help you lead a more balanced and enjoyable life. From simple dietary tweaks to dynamic fitness routines, we cover all the bases to help you start this journey.
- **Paragraph 2**: Discover how small changes can make a big impact on your well-being. Whether you're looking for quick meal ideas or effective workout routines, these tips are your roadmap to a healthier you. Dive into our blog for a complete guide.

# Notes

- Consider the target audience for the Facebook post and tailor the tone and content to that demographic.
- Ensure the headline and paragraphs are engaging and clear to drive social media engagement.
- Double-check grammar and spelling for a professional appearance.
- Avoid using jargon or overly complex language; keep it simple and relatable.
- The response should be concise and to the point, focusing on the most engaging aspects of the blog content.
- Do not include any additional commentary or explanations in your response. Just provide the formatted output as specified above.
- you can use icons or emojis if you think they will enhance the engagement of the post.
- Do not include any HTML tags or formatting in the output. Just plain text.
- Do not include any additional text or explanations. Just provide the formatted output as specified above.
- Do not include any disclaimers or notes about the AI's capabilities. Just provide the formatted output as specified above.
- Do not include any information about the AI model or its training. Just provide the formatted output as specified above.
- Do not include any information about the AI's limitations or potential errors. Just provide the formatted output as specified above.
- Do not include any information about the AI's knowledge cutoff date. Just provide the formatted output as specified above.
`;

    console.log('Calling OpenAI API...');
    const aiResponse: ChatCompletion = await openai.chat.completions.create({
      model: "gpt-4.5-preview", // Using the model specified by the user
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: blogContent, // Pass the blog content as user input
        },
      ],
      temperature: 1, // As per user's snippet (default is often lower)
      max_tokens: 2048, // As per user's snippet
      top_p: 1, // As per user's snippet
      // 'response_format', 'tools', 'tool_choice' etc. could be added if needed based on exact API version/needs
    });

    const aiContent: string | null = aiResponse.choices[0]?.message?.content;

    if (!aiContent) {
        console.error("OpenAI response content is null or empty.");
        return NextResponse.json({ error: "Failed to generate content from OpenAI" }, { status: 500 });
    }

    console.log('Successfully generated AI content. Raw response:', aiContent.substring(0, 100) + "...");

    // Parse the response based on the requested format
    const headlineMatch = aiContent.match(/Headline:\s*(.*)/);
    const paragraph1Match = aiContent.match(/Paragraph 1:\s*(.*)/);
    const paragraph2Match = aiContent.match(/Paragraph 2:\s*(.*)/);

    const headline = headlineMatch ? headlineMatch[1].trim() : "Headline could not be generated.";
    const paragraphs = [];
    if (paragraph1Match) paragraphs.push(paragraph1Match[1].trim());
    if (paragraph2Match) paragraphs.push(paragraph2Match[1].trim());

    if (paragraphs.length === 0) {
        console.warn("Could not parse paragraphs from OpenAI response. Returning raw content.");
        // Fallback or specific error handling might be needed here
        return NextResponse.json({ headline: headline, paragraphs: [aiContent] }); // Or return an error
    }

    return NextResponse.json({ headline, paragraphs });
  } catch (error: unknown) {
    console.error("Error in generate-summary API route:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `An error occurred processing the request: ${errorMessage}` },
      { status: 500 }
    );
  }
}