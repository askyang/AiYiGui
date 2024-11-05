// 轮播图功能
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentSlide = 0;

    // 创建轮播点
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dots.appendChild(dot);
    });

    // 切换到指定幻灯片
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        document.querySelectorAll('.dot')[currentSlide].classList.remove('active');
        currentSlide = (n + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        document.querySelectorAll('.dot')[currentSlide].classList.add('active');
    }

    // 下一张幻灯片
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }

    // 上一张幻灯片
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }

    // 添加按钮事件监听
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // 自动播放
    setInterval(nextSlide, 5000);

    // 平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // 聊天功能
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    // 添加消息到聊天框
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        messageDiv.textContent = content;
        chatMessages.appendChild(messageDiv);
        // 确保新消息可见
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 更新API配置
    const API_KEY = '1422e9ca7a586cef7e9e75c38db86f32.VA0fJ9pLeqszw9LC';
    const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    // 修改JWT Token生成函数
    async function generateToken(apiKey) {
        const [id, secret] = apiKey.split('.');
        const header = {
            'alg': 'HS256',
            'sign_type': 'SIGN'
        };
        
        const payload = {
            'api_key': id,
            'exp': Date.now() + 3600 * 1000,
            'timestamp': Date.now()
        };

        try {
            // 使用CryptoJS进行签名
            const encodedHeader = btoa(JSON.stringify(header));
            const encodedPayload = btoa(JSON.stringify(payload));
            
            const signatureInput = encodedHeader + "." + encodedPayload;
            const signature = CryptoJS.HmacSHA256(signatureInput, secret);
            const encodedSignature = CryptoJS.enc.Base64.stringify(signature);

            return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
        } catch (error) {
            console.error('Token generation failed:', error);
            return null;
        }
    }

    // 调用AI接口的函数
    async function callAIAPI(message) {
        try {
            const token = await generateToken(API_KEY);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'glm-4',
                    messages: [
                        {
                            role: 'user',
                            content: message
                        }
                    ]
                })
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API call failed:', error);
            return '抱歉，我遇到了一些问题，请稍后再试。';
        }
    }

    // 修改处理用户输入的函数
    async function handleUserInput() {
        const message = userInput.value.trim();
        if (message) {
            // 显示用户消息
            addMessage(message, true);
            // 清空输入框
            userInput.value = '';
            
            // 显示加载状态
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'ai-message');
            loadingDiv.textContent = '正在思考...';
            chatMessages.appendChild(loadingDiv);
            
            try {
                // 调用AI API
                const response = await callAIAPI(message);
                // 移除加载消息
                chatMessages.removeChild(loadingDiv);
                // 显示AI响应
                addMessage(response);
            } catch (error) {
                // 移除加载消息
                chatMessages.removeChild(loadingDiv);
                // 显示错误消息
                addMessage('抱歉，我遇到了一些问题，请稍后再试。');
            }
        }
    }

    // 添加点击发送按钮事件
    sendButton.addEventListener('click', handleUserInput);

    // 添加回车发送功能
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserInput();
        }
    });

    // 添加初始欢迎消息
    addMessage('你好！我是一归的AI助手，有什么我可以帮你的吗？');
}); 