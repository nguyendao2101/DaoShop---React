const askGemini = async (prompt) => {
    const res = await fetch('http://localhost:8797/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Gemini API error');
    return res.json();
};

export default { askGemini };