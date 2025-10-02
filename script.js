document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('webcam-video');
    const canvas = document.getElementById('ar-canvas');
    const ctx = canvas.getContext('2d');
    const infoBox = document.getElementById('info-box');
    const starNameEl = document.getElementById('star-name');
    const starInfoEl = document.getElementById('star-info');
    const companyConstellationEl = document.getElementById('company-constellation');

    const celestialObjects = [
        // 座標は画面の中心(0,0)からの相対的な位置を想定
        { name: 'ベガ (こと座)', constellation: 'こと座', x: 0.2, y: -0.3, info: '七夕の織姫星' },
        { name: 'アルタイル (わし座)', constellation: 'わし座', x: 0.4, y: 0.2, info: '七夕の彦星' },
        { name: 'デネブ (はくちょう座)', constellation: 'はくちょう座', x: -0.3, y: -0.1, info: '夏の大三角の頂点' },
        { name: 'カシオペヤ座', constellation: 'カシオペヤ座', x: -0.5, y: -0.7, info: 'Wの形が特徴' },
        { name: '北極星 (こぐま座)', constellation: 'こぐま座', x: -0.1, y: -0.8, info: '北の空に動かない星' },
        { name: '火星 (Planet Mars)', constellation: '太陽系', x: 0.6, y: -0.4, info: '赤い惑星' },
        { name: 'あなたの会社のサービス', constellation: 'ペガスス座', x: -0.4, y: 0.5, info: '未来を創造する技術' },
    ];

    const companyConstellationName = 'ペガスス座';
    companyConstellationEl.textContent = companyConstellationName;

    let isWebcamReady = false;
    let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
    let initialOrientation = null;

    // カメラ映像の取得と表示
    async function startWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                isWebcamReady = true;
                drawAR();
            };
        } catch (err) {
            console.error('Webカメラのアクセスに失敗しました', err);
            alert('Webカメラにアクセスできませんでした。HTTPS接続か、対応ブラウザで試してください。');
        }
    }

    // デバイスの向きを取得
    window.addEventListener('deviceorientation', (e) => {
        if (!initialOrientation) {
            initialOrientation = { alpha: e.alpha, beta: e.beta, gamma: e.gamma };
        }
        deviceOrientation = e;
    });

    // AR描画ループ
    function drawAR() {
        if (!isWebcamReady || !initialOrientation) {
            requestAnimationFrame(drawAR);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 画面の中心からの相対的なデバイスの動きを計算
        const alpha = deviceOrientation.alpha - initialOrientation.alpha;
        const beta = deviceOrientation.beta - initialOrientation.beta;
        const gamma = deviceOrientation.gamma - initialOrientation.gamma;

        celestialObjects.forEach(obj => {
            // デバイスの動きに応じて星の位置を計算
            const screenX = obj.x * canvas.width + (gamma / 90) * canvas.width;
            const screenY = obj.y * canvas.height + (beta / 90) * canvas.height;

            // 画面内に星が入っているかチェック
            if (screenX > 0 && screenX < canvas.width && screenY > 0 && screenY < canvas.height) {
                const isCompanyConstellation = obj.constellation === companyConstellationName;
                const color = isCompanyConstellation ? '#ffcc00' : '#66fcf1';
                const highlightSize = isCompanyConstellation ? 15 : 8;
                const fontSize = isCompanyConstellation ? 'bold 24px Roboto Mono' : '18px Roboto Mono';

                drawStar(screenX, screenY, highlightSize, color);
                
                ctx.fillStyle = color;
                ctx.font = fontSize;
                ctx.fillText(obj.name, screenX + 25, screenY + 5);
            }
        });

        // 会社の星座をハイライト表示
        const companyObject = celestialObjects.find(obj => obj.constellation === companyConstellationName);
        if (companyObject) {
            starNameEl.textContent = companyObject.name;
            starInfoEl.textContent = companyObject.info;
        } else {
            starNameEl.textContent = '見つかりませんでした';
            starInfoEl.textContent = '';
        }

        requestAnimationFrame(drawAR);
    }

    function drawStar(cx, cy, size, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(cx, cy, size, 0, Math.PI * 2);
        ctx.fill();
    }

    startWebcam();
});
