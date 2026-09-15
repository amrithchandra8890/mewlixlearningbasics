export default async function (request) {
    try {
        if (request.method !== "POST") {
            return new Response(
                JSON.stringify({
                    error: "Only POST requests are allowed."
                }),
                {
                    status: 405,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const body = await request.json();

        if (!body.prompt) {
            return new Response(
                JSON.stringify({
                    error: "No prompt was provided."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    error: "OPENROUTER_API_KEY is not available to the function."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const result = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": "Bearer " + apiKey,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://mewlixlearningbasics.netlify.app",
                    "X-Title": "MEWLIX LEARNING"
                },

                body: JSON.stringify({
                    model: "openrouter/free",

                    messages: [
                        {
                            role: "system",
                            content:
                                "You are the AI learning assistant for MEWLIX LEARNING. " +
                                "Give clear, accurate and age-appropriate educational answers. " +
                                "Explain information in your own words. " +
                                "Do not unnecessarily repeat the user's question or source text."
                        },
                        {
                            role: "user",
                            content: body.prompt
                        }
                    ],

                    temperature: 0.7
                })
            }
        );

        const raw = await result.text();

        let data;

        try {
            data = JSON.parse(raw);
        } catch (e) {
            return new Response(
                JSON.stringify({
                    error: "OpenRouter returned a non-JSON response.",
                    status: result.status
                }),
                {
                    status: 502,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        if (!result.ok) {
            return new Response(
                JSON.stringify({
                    error:
                        data?.error?.message ||
                        "OpenRouter request failed.",
                    status: result.status
                }),
                {
                    status: result.status,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const answer =
            data?.choices?.[0]?.message?.content;

        if (!answer) {
            return new Response(
                JSON.stringify({
                    error: "OpenRouter returned no answer."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        return new Response(
            JSON.stringify({
                answer: answer
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        return new Response(
            JSON.stringify({
                error: "Function error: " + error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}