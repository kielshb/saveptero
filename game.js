// ambil canvas
    const canvas = document.getElementById("gameCanvas");

    // ambil context 2D
    const ctx = canvas.getContext("2d");

    // background image
    const background = new Image();
    background.src = "assets/background.png";

    // meteor images
    const meteorImages = new Image();
    meteorImages.src = "assets/meteor.png";

    // karakter image
    const pterosaurus= new Image();
    pterosaurus.src = "assets/pterosaurus.png";

    // posisi dino
    let dinoX = 350;
    let dinoY = 400;

    // ukuran karakter
    let dinoWidth = 90;
    let dinoHeight = 90;

    // hitbox karakter
    let hitboxWidth = 45;
    let hitboxHeight = 45;

    // kecepatan
    let speed = 6;

    // kumpulan meteor
    let meteors = [];

    // kumpulan particle
    let particles = [];

    // kumpulan bintang
    let stars = [];

    // kumpulan awan
    let clouds = [];

    // difficulty meteor
    let meteorSpeed = 5;
    let spawnRate = 1000;

    // timer spawn meteor
    let spawnTimer = 0;

    // keyboard state
    let leftPressed = false;
    let rightPressed = false;

    // status game
    let gameOver = false;

    let showGamerOverPopup = false;

    // status mulai game
    let gameStarted = false;

    //score
    let score = 0;

    let highScore = 0;

    // waktu bertahan
    let survivalTime = 0;

    // transition phase
    let isTransition = false;
    let transitionTimer = 0;

    // screen shake
    let shakeTimer = 0;

    // idle floating timer
    let floatTimer = 0;

    // membuat particle api
    function createFireParticle(x, y) {
        let particle = {
            x: x,
            y: y,
            
            velocityX: (Math.random() - 0.5) * 6,
            velocityY: -1 - Math.random() * 2,
            size: 0.2 + Math.random() * 1.4,
            alpha: 1,
            decay: 0.06,
            color:
            Math.random() > 0.5 
            ? "#ff5a00" :
            "#fca019"
    };
        if (particles.length < 300) {
            particles.push(particle);
        }
    }

    // membuat bintang
    function createStars(){
        for(let i = 0; i < 100; i++){
            let star = {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2,
                alpha: 0.3 + Math.random() * 0.7,
                twinkleSpeed: 0.01 + Math.random() * 0.03
            };
            
            stars.push(star);
        }
    }

    // membuat awan
    function createClouds(){
        for(let i = 0; i < 6; i++){
            let cloud = {
                x: Math.random() * canvas.width,
                y: Math.random() * 250,
                width: 180 + Math.random() * 180,
                height: 60 + Math.random() * 60,
                speed: 0.05 + Math.random() * 0.1,
                alpha: 0.12 + Math.random() * 0.12
            };

            clouds.push(cloud);
        }
    }

    // membuat meteor baru
    function spawnMeteor() {

        // ukuran random meteor
        let randomSize = 30 + Math.random() * 50;

        let meteor = {

            x: Math.random() * 760,
            y: -40,
            width: randomSize,
            height: randomSize,
            
            speed: meteorSpeed,

            velocityX: (Math.random() - 0.5) * 4,

            angle: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.1,

            image: meteorImages
        
        };

        meteors.push(meteor);
    }



    // tekan keyboard
    document.addEventListener("keydown", function(event) {

        if(gameOver && !event.repeat) {

            if(
                event.code === "ArrowLeft" ||
                event.code === "ArrowRight" ||
                event.code === "KeyA" ||
                event.code === "KeyD" ||
                event.code === "Space"
            ) {

            leftPressed = false;
            rightPressed = false;
            
            resetGame();
            return;
            }
        }

        if(!gameStarted) {

            if(
                event.code === "ArrowLeft" ||
                event.code === "ArrowRight" ||
                event.code === "KeyA" ||
                event.code === "KeyD"
            ) {
                gameStarted = true;
                return;
              }
        }

        if (
            event.code === "ArrowLeft"
            ||
            event.code === "KeyA"
        ) {
            leftPressed = true;
        }
        if (
            event.code === "ArrowRight"
            ||
            event.code === "KeyD"
        ) {
            rightPressed = true;
        }
    });

    // lepas keyboard
    document.addEventListener("keyup", function(event) {

        if (
            event.code === "ArrowLeft"
            ||
            event.code === "KeyA"
        ) {
            leftPressed = false;
        }
        if (
            event.code === "ArrowRight"
            ||
            event.code === "KeyD"
        ) {
            rightPressed = false;
        }
    });

    // click play button
    canvas.addEventListener("click", function(event) {
        let rect = canvas.getBoundingClientRect();

        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        // area tombol play
        if(
           mouseX >= 300 &&
           mouseX <= 500 &&
           mouseY >= 250 &&
           mouseY <=320
        ) {
           gameStarted = true;
        }
        // area tombol restart
        if(gameOver){
            
            leftPressed = false;
            rightPressed = false;
        
            resetGame();
            return;
        }
           
    });


    // reset game
    function resetGame() {

        // reset posisi dino
        dinoX = 350;
        dinoY = 400;

        // reset meteor
        meteors = [];
        // reset score
        score = 0;
        // reset waktu
        survivalTime = 0;
        // reset spawn
        spawnTimer = 0;
        // reset game over
        gameOver = false;

        leftPressed = false;
        rightPressed = false;

        // mulai game lagi
        gameStarted = true;
    }

    function drawRoundRect(x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);

        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // game loop
    function gameLoop() {

        // screen play button
        if(!gameStarted) {

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // background
            ctx.drawImage(
                background,
                0,
                0,
                canvas.width,
                canvas.height
            );

            // gambar awan diam
            for(let i = 0; i < clouds.length; i++){

                ctx.globalAlpha = clouds[i].alpha;

                ctx.fillStyle = "#4b3f72";

                ctx.beginPath();

                // gumpalan kiri
                ctx.arc(
                    clouds[i].x,
                    clouds[i].y,
                    clouds[i].height * 0.6,
                    0,
                    Math.PI * 2
                );

                // gumpalan tengah
                ctx.arc(
                    clouds[i].x + clouds[i].width * 0.25,
                    clouds[i].y - clouds[i].height * 0.2,
                    clouds[i].height * 0.8,
                    0,
                    Math.PI * 2
                );

                // gumpalan kanan
                ctx.arc(
                    clouds[i].x + clouds[i].width * 0.5,
                    clouds[i].y,
                    clouds[i].height * 0.65,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // gambar bintang diam
            for(let i = 0; i < stars.length; i++){

                ctx.globalAlpha = stars[i].alpha;

                ctx.fillStyle = "white";

                ctx.beginPath();

                ctx.arc(
                    stars[i].x,
                    stars[i].y,
                    stars[i].size,
                    0,
                    Math.PI * 2
                );

                ctx.fill();
            }

            ctx.globalAlpha = 1;

            // pterosaurus menu
            ctx.drawImage(
                pterosaurus,
                350,
                400,
                dinoWidth,
                dinoHeight
            );

            const popupWidth = 250;
            const popupHeight = 150;

            const popupX =
            (canvas.width - popupWidth) / 2;

            const popupY =
            (canvas.height - popupHeight) / 2;

            // background popup
            ctx.fillStyle =
            "rgba(0, 0, 0, 0.85)";

            ctx.fillRect(
                popupX,
                popupY,
                popupWidth,
                popupHeight
            );

            // border
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;

            ctx.strokeRect(
                popupX,
                popupY,
                popupWidth,
                popupHeight
            );

            // tittle
            ctx.fillStyle = "white";
            ctx.font = "55px 'VT323'";
            ctx.textAlign = "center";

            ctx.fillText(
                "Save Dino",
                canvas.width / 2,
                popupY + 60
            );

            // play button
            ctx.font = "40px 'VT323'";

            ctx.fillText(
                "Play",
                canvas.width / 2,
                popupY + 120
            );

            ctx.textAlign = "left";

            requestAnimationFrame(gameLoop);
            return;
        }


        // jika game over
        if (gameOver) {
            
        }
        
        // tambah waktu bertahan
        if(!gameOver){
            survivalTime += 1 / 60;
            score = survivalTime * 100;
        
        }

        if(!gameOver){
            floatTimer += 0.05;
        }

        // timer transition
        if(isTransition){

            transitionTimer += 1 / 60;
        }

        //trigger transition phase
        if(
            Math.floor(survivalTime) === 20
            ||
            Math.floor(survivalTime) === 40
            ||
            Math.floor(survivalTime) === 60
        ){
            isTransition = true;
        }

        // selesai transition
        if(transitionTimer >= 1.5){
            isTransition = false;
            transitionTimer = 0;
        }

        // level easy
        if (survivalTime <= 20) {
            meteorSpeed = 5;
            spawnRate = 900;
        }

        // level medium
        else if (survivalTime <= 40) {
            meteorSpeed = 7;
            spawnRate = 700;
        }

        // level hard
        else {
            meteorSpeed = 9;
            spawnRate = 600;

            // chaos mode
            if(
                Math.floor(survivalTime - 60) % 35 < 15
                &&
                survivalTime > 60
            ){
                meteorSpeed = 10;
                spawnRate = 180;
            }
        }

        // timer spawn meteor
        spawnTimer += 16;

        // spawn meteor
        if(spawnTimer >= spawnRate
            &&
            !isTransition
            &&
            !gameOver
        ) {
            spawnMeteor();
            spawnTimer = 0;
        }    

        // bersihkan canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // gambar background
        ctx.drawImage(
            background,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // gambar awan
        for(let i = 0; i < clouds.length; i++){

            if(!gameOver){
            clouds[i].x += clouds[i].speed;
            }

            // ulang posisi awan
            if(clouds[i].x > canvas.width + 200){

                clouds[i].x = -200;

                clouds[i].y =
                Math.random() * 250;
            }

            ctx.globalAlpha = clouds[i].alpha;

            ctx.fillStyle = "#4b3f72";


            ctx.beginPath();


            // gumpalan kiri
            ctx.arc(

                clouds[i].x,
                clouds[i].y,

                clouds[i].height * 0.6,

                0,
                 Math.PI * 2

            );


            // gumpalan tengah
            ctx.arc(

                clouds[i].x + clouds[i].width * 0.25,
                clouds[i].y - clouds[i].height * 0.2,

                clouds[i].height * 0.8,

                0,
                Math.PI * 2

            );


            // gumpalan kanan
            ctx.arc(

            clouds[i].x + clouds[i].width * 0.5,
            clouds[i].y,

            clouds[i].height * 0.65,

            0,
            Math.PI * 2

        );

        // gumpalan bawah kiri
        ctx.arc(

            clouds[i].x +
            clouds[i].width * 0.15,

            clouds[i].y +
            clouds[i].height * 0.2,

            clouds[i].height * 0.5,

            0,
            Math.PI * 2

        );


        // gumpalan bawah kanan
        ctx.arc(

            clouds[i].x +
            clouds[i].width * 0.4,

            clouds[i].y +
            clouds[i].height * 0.15,

            clouds[i].height * 0.45,

            0,
            Math.PI * 2

        );


        ctx.fill();
    }

ctx.globalAlpha = 1;

        // gambar bintang
        for(let i = 0; i < stars. length; i++){

            // efek twinkle
            if(!gameOver){
                
                stars[i].alpha +=
                Math.sin(
                    Date.now() *
                    stars[i].twinkleSpeed) * 0.01;
            }

            // batas aplha
            if(stars[i].alpha > 1){
                stars[i].alpha = 1;
            }

            if(stars[i].alpha < 0.2){
                stars[i].alpha = 0.2;
            }

            ctx.globalAlpha = stars[i].alpha;
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(
                stars[i].x,
                stars[i].y,
                stars[i].size,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }

        ctx. globalAlpha = 1;


        // gerakan dino
        if(!gameOver) {
        
            if (leftPressed) {
                dinoX -= speed;
            }

            if (rightPressed) {
            dinoX += speed;
            }
        }   

        // batas kiri
        if (dinoX < 0) {
            dinoX = 0;
        }

        // batas kanan
        if (dinoX > 700) {
            dinoX = 700;
        }

        // update dan gambar semua meteor
        for (let i = 0; i < meteors.length; i++) {
            if(!gameOver){

                meteors[i].y += meteors[i].speed;
                meteors[i].x += meteors[i].velocityX;
                meteors[i].angle +=
                meteors[i].rotationSpeed;
            }

            //buat particle api
            for (let p = 0; p < 5; p++) {

            let trailX =
            meteors[i].x +
            meteors[i].width / 2;

            let trailY =
            meteors[i].y +
            meteors[i].height / 2;


            // random area belakang meteor
            trailX +=
            (Math.random() - 0.5) *
            meteors[i].width * 0.8;

            trailY +=
            (Math.random() - 0.5) *
            meteors[i].height * 0.8;


            // sedikit offset ke belakang
            trailY -= meteors[i].speed * 2;


            createFireParticle(
            trailX,
            trailY
            );
        }
                

            // hapus meteor jika keluar layar
            if (meteors[i].y > canvas.height) {

                meteors.splice(i, 1);
                i--;
                continue;
            }

            // simpan canvas state
            ctx.save();

            // pindahkan titik putar ke tengah meteor
            ctx.translate(
                meteors[i].x + meteors[i].width / 2,
                meteors[i].y + meteors[i].height / 2
            );

            // rotasi canvas
            ctx.rotate(meteors[i].angle);

            // gambar meteor
            ctx.drawImage(
                meteors[i].image,
                -meteors[i].width / 2,
                -meteors[i].height / 2,
                
                meteors[i].width,
                meteors[i].height
            );

            // kembalikan canvas state
            ctx.restore();

            // collision detection
            if(
                meteors[i].x < dinoX + hitboxWidth - 10 &&
                meteors[i].x + meteors[i].width > dinoX + 25 &&
                meteors[i].y < dinoY + hitboxHeight - 10&&
                meteors[i].y + meteors[i].height > dinoY + 25
            
            ){

            if(score > highScore){
                highScore = Math.floor(score);
            }
            gameOver = true;
            showGamerOverPopup = true;
        }
    }   

        // update dan gambar semua particle
        for (let i = 0; i < particles.length; i++) {

            if(!gameOver) {
                particles[i].x += particles[i].velocityX;
                particles[i].y += particles[i].velocityY;
                particles[i].alpha -= particles[i].decay;
            }

            // hapus particle lama
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }

            // transparansi particle
            ctx.globalAlpha = particles[i].alpha;
            ctx.fillStyle = particles[i].color;
            ctx.shadowBlur = 0;
            ctx.shadowColor = particles[i].color;

            // gambar particle
            ctx.beginPath();
            ctx.arc(
                particles[i].x,
                particles[i].y,
                particles[i].size,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // reset alpha
            ctx.globalAlpha = 1;
        }

        // tampilkan score
        ctx.fillStyle = "white";
        ctx.font = "20px monospace";
        // format score 5 digit
        let displayScore = Math.floor(score).toString().padStart(5, "0");

        let displayHighScore = highScore.toString().padStart(5, "0");

        ctx.fillText(displayScore + "   HI " + displayHighScore, 20, 40);

        // efek idle floating
        let floatOffset = Math.sin(floatTimer) * 5;

        //gambar karakter
        ctx.drawImage(
            pterosaurus,
            dinoX,
            dinoY + floatOffset,
            dinoWidth,
            dinoHeight
        )

    if(gameOver) {

        const popupWidth = 250;
        const popupHeight = 140;

        const popupX =
        (canvas.width - popupWidth) / 2;

        const popupY =
        (canvas.height - popupHeight) / 2;

        // background popup
        ctx.fillStyle =
        "rgba(0, 0, 0, 0.85)";

        ctx.fillRect(
            popupX,
            popupY,
            popupWidth,
            popupHeight
        );

        // border
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;

        ctx.strokeRect(
            popupX,
            popupY,
            popupWidth,
            popupHeight
        );

        // text
        ctx.fillStyle = "white";
        ctx.font = "45px 'VT323'";
        ctx.textAlign = "center";

        ctx.fillText(
            "Game Over",
            canvas.width / 2,
            popupY + 50
        );

        // restart icon
        ctx.font = "48px 'VT323'";

        ctx.fillText(
            "↻",
            canvas.width / 2,
            popupY + 110
        );

        ctx.textAlign = "left";
    }

        //ulang frame
        requestAnimationFrame(gameLoop);
    }

    // buat bintang
    createStars();

    //buat awan
    createClouds();


    // mulai game
    document.fonts.ready.then(() => {
        gameLoop();
    });
