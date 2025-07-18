const chatBox = document.getElementById('chat-box');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// 명언 리스트 (30개 예시, 필요시 추가 가능)
const quotes = [
    '성공은 준비와 기회의 만남이다. - 세네카',
    '오늘 할 수 있는 일을 내일로 미루지 마라. - 벤자민 프랭클린',
    '실패는 성공의 어머니이다. - 존 맥스웰',
    '노력은 배신하지 않는다. - 김연아',
    '행동이 운명을 결정한다. - 토마스 에디슨',
    '포기하지 마라. 큰일은 작은 노력의 반복이다. - 헨리 포드',
    '자신을 믿어라. - 나폴레옹',
    '꿈은 이루어진다. - 월트 디즈니',
    '도전 없는 성공은 없다. - 알버트 아인슈타인',
    '긍정적인 생각이 인생을 바꾼다. - 노먼 빈센트 필',
    '작은 성취가 큰 성공을 만든다. - 오프라 윈프리',
    '인내는 쓰지만 그 열매는 달다. - 장 자크 루소',
    '기회는 준비된 자에게 온다. - 루이스 파스퇴르',
    '실패를 두려워하지 마라. - 마이클 조던',
    '오늘의 선택이 내일을 만든다. - 스티브 잡스',
    '성공은 용기에서 시작된다. - 윈스턴 처칠',
    '노력은 언젠가 보상받는다. - 박지성',
    '자신감이 최고의 무기다. - 손흥민',
    '배움에는 끝이 없다. - 공자',
    '행복은 마음에서 시작된다. - 달라이 라마',
    '실패는 성장의 기회다. - 빌 게이츠',
    '도전은 나를 강하게 만든다. - 유재석',
    '성공은 포기하지 않는 자의 것이다. - 마더 테레사',
    '매일 조금씩 나아가라. - 이순신',
    '긍정은 힘이다. - 유노윤호',
    '자신을 사랑하라. - BTS',
    '노력은 결코 헛되지 않는다. - 이병헌',
    '실패를 통해 배워라. - 이재용',
    '꿈꾸는 자만이 이룬다. - 박찬호',
    '오늘을 살아라. - 유관순'
];

function getTodayQuote() {
    // 오늘 날짜를 기반으로 명언 선택 (매일 고유하게)
    const today = new Date();
    const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    // quotes 배열 길이로 나눠서 인덱스 결정
    const idx = daySeed % quotes.length;
    return quotes[idx];
}


// OpenAI API 키를 여기에 직접 입력하세요 (예시: 'sk-xxxx...')
const OPENAI_API_KEY = 'api-key';

// 이전 대화 저장용 배열
const messages = [
    { role: 'system', content: '너는 친절한 챗봇이야.' }
];

function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, sender, isImage = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    // 시간 추가
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    if (isImage) {
        msgDiv.innerHTML = `<span class="msg-text"><img src="${text}" alt="생성된 이미지" style="max-width:220px; max-height:220px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.12);" /></span> <span class="msg-time">${timeStr}</span>`;
    } else {
        msgDiv.innerHTML = `<span class="msg-text">${text}</span> <span class="msg-time">${timeStr}</span>`;
    }
    chatBox.appendChild(msgDiv);
    scrollToBottom();
}

// 페이지 로드 시 오늘의 명언 출력
window.addEventListener('DOMContentLoaded', function() {
    const quote = getTodayQuote();
    appendMessage('오늘의 명언: ' + quote, 'bot');

    // 테마 전환 기능
    const themeSelect = document.getElementById('theme-select');
    const modeLabel = document.getElementById('mode-label');
    themeSelect.addEventListener('change', function() {
        document.body.classList.remove('theme-mint', 'theme-lavender', 'theme-neon', 'dark-mode');
        if (themeSelect.value === 'mint') {
            document.body.classList.add('theme-mint');
            modeLabel.textContent = '민트 테마';
        } else if (themeSelect.value === 'lavender') {
            document.body.classList.add('theme-lavender');
            modeLabel.textContent = '라벤더 테마';
        } else if (themeSelect.value === 'neon') {
            document.body.classList.add('theme-neon');
            modeLabel.textContent = '네온 테마';
        } else if (themeSelect.value === 'dark') {
            document.body.classList.add('dark-mode');
            modeLabel.textContent = '다크모드';
        } else {
            modeLabel.textContent = '팬톤(기본)';
        }
    });
    // 페이지 로드시 기본값
    themeSelect.dispatchEvent(new Event('change'));

    // 마우스 드래그로 대화창 크기 조절 기능
    const chatContainer = document.getElementById('chat-container');
    const resizeHandle = document.getElementById('resize-handle');
    let isResizing = false;
    let lastX = 0, lastY = 0, startWidth = 0, startHeight = 0;

    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        lastX = e.clientX;
        lastY = e.clientY;
        startWidth = chatContainer.offsetWidth;
        startHeight = chatContainer.offsetHeight;
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        let newWidth = Math.max(280, Math.min(700, startWidth + dx));
        let newHeight = Math.max(420, Math.min(900, startHeight + dy));
        chatContainer.style.width = newWidth + 'px';
        chatContainer.style.height = newHeight + 'px';
    });

    window.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.userSelect = '';
        }
    });
});
async function botReply(userText) {
    // 실시간 답변 표시용 div 생성
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message bot';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    msgDiv.innerHTML = `<span class="msg-text">답변 생성 중...</span> <span class="msg-time">${timeStr}</span>`;
    chatBox.appendChild(msgDiv);
    scrollToBottom();

    messages.push({ role: 'user', content: userText });
    let botText = '';
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 200,
                stream: true
            })
        });
        if (!response.body) throw new Error('스트림 응답을 지원하지 않는 환경입니다.');
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;
        let fullText = '';
        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
                const chunk = decoder.decode(value);
                // OpenAI 스트림 응답 파싱
                chunk.split('data:').forEach(line => {
                    line = line.trim();
                    if (!line || line === '[DONE]') return;
                    try {
                        const json = JSON.parse(line);
                        const delta = json.choices?.[0]?.delta?.content;
                        if (delta) {
                            fullText += delta;
                            msgDiv.querySelector('.msg-text').textContent = fullText;
                            scrollToBottom();
                        }
                    } catch {}
                });
            }
        }
        // 스트림 완료 후 메시지 배열에 추가
        if (fullText) {
            messages.push({ role: 'assistant', content: fullText });
        } else {
            msgDiv.querySelector('.msg-text').textContent = 'API 응답 오류: 실시간 답변을 받지 못했습니다.';
        }
    } catch (err) {
        msgDiv.querySelector('.msg-text').textContent = 'API 호출 실패: ' + err.message;
    }
    scrollToBottom();
}

async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;
    appendMessage(userText, 'user');

    // 1. 먼저 gpt-4o-mini로 userText가 이미지 생성 요청인지 판별
    let isImageRequest = false;
    let imagePrompt = '';
    try {
        const analysisRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: '다음 사용자 입력이 이미지를 생성해달라는 요청인지 판별해서, 이미지 생성 요청이면 "Y: <이미지 프롬프트>"로, 아니면 "N"으로만 답해. 예시: "고양이 사진 보여줘" -> "Y: 고양이 사진". "오늘 날씨 알려줘" -> "N".' },
                    { role: 'user', content: userText }
                ],
                max_tokens: 30
            })
        });
        const analysisData = await analysisRes.json();
        const analysisText = analysisData.choices?.[0]?.message?.content?.trim() || '';
        if (analysisText.startsWith('Y:')) {
            isImageRequest = true;
            imagePrompt = analysisText.replace('Y:', '').trim();
        }
    } catch {}

    // 2. 이미지 생성 요청이면 DALL-E 3 호출
    if (isImageRequest && imagePrompt) {
        appendMessage('이미지 생성 중...', 'bot');
        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: imagePrompt,
                    n: 1,
                    size: '1024x1024'
                })
            });
            const data = await response.json();
            // 기존 "이미지 생성 중..." 메시지 삭제
            const lastBotMsg = chatBox.querySelector('.message.bot:last-child');
            if (lastBotMsg && lastBotMsg.textContent?.includes('이미지 생성 중...')) {
                chatBox.removeChild(lastBotMsg);
            }
            if (data.data && data.data[0] && data.data[0].url) {
                appendMessage(data.data[0].url, 'bot', true);
            } else {
                let recommendMsg = '이미지 생성 실패: ' + (data.error?.message || '알 수 없는 오류') + '<br><br>';
                recommendMsg += '<b>실패 원인 안내:</b><br>';
                recommendMsg += '- OpenAI DALL-E 3 API는 결제 계정, 권한, 국가(한국 등) 제한, 프롬프트 정책 등 다양한 이유로 이미지 생성이 제한될 수 있습니다.<br>';
                recommendMsg += '- 무료 계정 또는 일부 국가에서는 이미지 생성이 불가능하거나, 결제/권한이 필요할 수 있습니다.<br>';
                recommendMsg += '- 프롬프트가 정책에 맞지 않거나, OpenAI 서버 문제일 수도 있습니다.<br>';
                recommendMsg += '<br>직접 이미지를 제공할 수는 없지만, 귀여운 고양이 이미지를 찾는 데 도움이 될 수 있는 몇 가지 사이트를 추천해드릴게요.<br>';
                recommendMsg += '1. <a href="https://unsplash.com/s/photos/cute-cat" target="_blank">Unsplash</a><br>';
                recommendMsg += '2. <a href="https://www.pexels.com/search/cute%20cat/" target="_blank">Pexels</a><br>';
                recommendMsg += '3. <a href="https://pixabay.com/images/search/cute%20cat/" target="_blank">Pixabay</a><br>';
                recommendMsg += '이 사이트들에서 "cute cat" 혹은 "귀여운 고양이"라고 검색하시면 원하는 이미지를 쉽게 찾으실 수 있을 거예요!';
                appendMessage(recommendMsg, 'bot');
            }
        } catch (err) {
            // 기존 "이미지 생성 중..." 메시지 삭제
            const lastBotMsg = chatBox.querySelector('.message.bot:last-child');
            if (lastBotMsg && lastBotMsg.textContent?.includes('이미지 생성 중...')) {
                chatBox.removeChild(lastBotMsg);
            }
            appendMessage('이미지 생성 API 호출 실패: ' + err.message, 'bot');
        }
        userInput.value = '';
        return;
    }

    // 기존 /이미지 명령도 지원
    if (userText.startsWith('/이미지')) {
        const prompt = userText.replace('/이미지', '').trim();
        if (!prompt) {
            appendMessage('이미지 프롬프트를 입력하세요. 예: /이미지 귀여운 고양이', 'bot');
            userInput.value = '';
            return;
        }
        appendMessage('이미지 생성 중...', 'bot');
        try {
            const response = await fetch('https://api.openai.com/v1/images/generations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'dall-e-3',
                    prompt: prompt,
                    n: 1,
                    size: '1024x1024'
                })
            });
            const data = await response.json();
            // 기존 "이미지 생성 중..." 메시지 삭제
            const lastBotMsg = chatBox.querySelector('.message.bot:last-child');
            if (lastBotMsg && lastBotMsg.textContent?.includes('이미지 생성 중...')) {
                chatBox.removeChild(lastBotMsg);
            }
            if (data.data && data.data[0] && data.data[0].url) {
                appendMessage(data.data[0].url, 'bot', true);
            } else {
                let recommendMsg = '이미지 생성 실패: ' + (data.error?.message || '알 수 없는 오류') + '<br><br>';
                recommendMsg += '<b>실패 원인 안내:</b><br>';
                recommendMsg += '- OpenAI DALL-E 3 API는 결제 계정, 권한, 국가(한국 등) 제한, 프롬프트 정책 등 다양한 이유로 이미지 생성이 제한될 수 있습니다.<br>';
                recommendMsg += '- 무료 계정 또는 일부 국가에서는 이미지 생성이 불가능하거나, 결제/권한이 필요할 수 있습니다.<br>';
                recommendMsg += '- 프롬프트가 정책에 맞지 않거나, OpenAI 서버 문제일 수도 있습니다.<br>';
                recommendMsg += '<br>직접 이미지를 제공할 수는 없지만, 귀여운 고양이 이미지를 찾는 데 도움이 될 수 있는 몇 가지 사이트를 추천해드릴게요.<br>';
                recommendMsg += '1. <a href="https://unsplash.com/s/photos/cute-cat" target="_blank">Unsplash</a><br>';
                recommendMsg += '2. <a href="https://www.pexels.com/search/cute%20cat/" target="_blank">Pexels</a><br>';
                recommendMsg += '3. <a href="https://pixabay.com/images/search/cute%20cat/" target="_blank">Pixabay</a><br>';
                recommendMsg += '이 사이트들에서 "cute cat" 혹은 "귀여운 고양이"라고 검색하시면 원하는 이미지를 쉽게 찾으실 수 있을 거예요!';
                appendMessage(recommendMsg, 'bot');
            }
        } catch (err) {
            // 기존 "이미지 생성 중..." 메시지 삭제
            const lastBotMsg = chatBox.querySelector('.message.bot:last-child');
            if (lastBotMsg && lastBotMsg.textContent?.includes('이미지 생성 중...')) {
                chatBox.removeChild(lastBotMsg);
            }
            appendMessage('이미지 생성 API 호출 실패: ' + err.message, 'bot');
        }
        userInput.value = '';
        return;
    }

    // 일반 텍스트는 gpt-4o-mini 답변
    botReply(userText);
    userInput.value = '';
}


chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    sendMessage();
});

userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
