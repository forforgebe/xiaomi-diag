// Xiaomi MiMo API configuration
// Get your API key from: https://platform.xiaomimimo.com

export const MIMO_CONFIG = {
  baseUrl: 'https://api.xiaomimimo.com/v1',
  // ⚠️ In production, use environment variable: process.env.NEXT_PUBLIC_MIMO_API_KEY
  apiKey: process.env.NEXT_PUBLIC_MIMO_API_KEY || 'YOUR_MIMO_API_KEY',
  model: 'mimo-v2.5-pro',
};

export async function analyzeWithMiMo(logs: string, deviceInfo: string): Promise<string> {
  const prompt = `You are a Xiaomi device diagnostics expert. Analyze the following device data and provide a clear diagnosis.

DEVICE INFO:
${deviceInfo}

LOGS:
${logs}

Provide:
1. **Summary:** What's the main issue (if any)?
2. **Root Cause:** What's causing it?
3. **Severity:** 🟢 Healthy / 🟡 Minor / 🔴 Critical
4. **Solution:** Step-by-step fix instructions
5. **Known Issue?** Is this a known Xiaomi ROM bug? Any official fix ETA?

Keep it clear, practical, and user-friendly.`;

  try {
    const res = await fetch(`${MIMO_CONFIG.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MIMO_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: MIMO_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      throw new Error(`MiMo API error: ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No analysis available.';
  } catch (err: any) {
    console.error('MiMo API call failed:', err);
    return `⚠️ **AI analysis unavailable.** The MiMo API call failed.\n\nFallback: Basic heuristics applied.\n\nError: ${err.message}\n\nCheck your API key in .env.local`;
  }
}
