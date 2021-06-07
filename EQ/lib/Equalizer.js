class JDroidFx {
    constructor({loader,canvaSelector,currentTime,durationTime,}){
        this.audio = new Audio();
        this.visualColor = "#F0B039"
        this.volume = 0.17;
        this.frameRate = 0.8;
        this.balance = 0;
        this.visuals = "select visual";
        this.bassBoost = false;
        this.Crystalizer = false;
        this.AudioLoop = false;
        this.Convolver = false;
        this.Bassboast = false;
        this.RoomEffects = false;
        this.Limit = false;
        this.RoomEffect = "Select-Effect"
        this.settings = {
            loader: document.querySelector(loader),
            canvaSelector:canvaSelector,
            currentTime:document.querySelector(currentTime),
            durationTime: document.querySelector(durationTime)
    };
    this.files = function (e) {
        var files = e.currentTarget.files;
        var list = (Object.values(files));
        var data;
        var style = {
                textColor:"red",
                padding:10+"px",
                fontSize:15+"px",
                cursor:"pointer"
        };
        var playlist = [];
        for (const key in list) {
            if (Object.hasOwnProperty.call(list, key)) {
                const element = list[key];
                console.log(key)
                playlist.push(element);
                var hr = document.createElement("hr");
                var p = document.createElement('p');
                var textNode = document.createTextNode(element.name);
                p.append(textNode);
                this.audio.src = URL.createObjectURL(element);
                p.style.fontSize = style.fontSize;
                p.style.color = style.textColor;
                p.style.cursor = style.cursor;
                p.onclick = () => {
                    this.audio.play();
                }

                
                document.querySelector("fieldset").appendChild(p).appendChild(hr);
            }
        }
        // console.log(list)
    }.bind(this)

    this.defaults = {
            frames:0.8,
            audioLoop:false,
            volume:0.20,
            balance: 0,
            visualColor:"#F0B039"
};
    // return defaults;
// Web Audio Api
        // window.AudioContext = window.AudioContext || -webkitAudioContext;
        this.audioCtx = new AudioContext();
        var canvas = document.querySelector(this.settings.canvaSelector);
        var context = canvas.getContext("2d"); // using part of the canvas Api
        this.analyser = this.audioCtx.createAnalyser();
        this.gain = this.audioCtx.createGain();
        this.bassBoost = this.audioCtx.createGain();
        this.crystalBoost = this.audioCtx.createGain();
        this.source = this.audioCtx.createMediaElementSource(this.audio);
        this.crystal = this.audioCtx.createBiquadFilter();
        this.bass = this.audioCtx.createBiquadFilter();
        this.panner = this.audioCtx.createStereoPanner();
        this.treble = this.audioCtx.createBiquadFilter();
        this.splitter = this.audioCtx.createChannelSplitter(2);
        this.merger = this.audioCtx.createChannelMerger(2);
        this.compressor = this.audioCtx.createDynamicsCompressor();
        this.delay1 = this.audioCtx.createDelay();
        this.delay2 = this.audioCtx.createDelay();
        this.surround = this.audioCtx.createConvolver();
        this.frequencyDomain = new Uint8Array(this.analyser.frequencyBinCount);
        this.byteSize = this.analyser.frequencyBinCount;
        // audio volume
        this.audio.volume = this.defaults.volume;//volume
// effects
        this.leftDelay = this.audioCtx.createDelay();
        this.rightDelay = this.audioCtx.createDelay();
        this.leftFeedback = this.audioCtx.createGain();
        this.rightFeedback = this.audioCtx.createGain();
     

// function to load music
        this.loadTrack = (e) => {
            var file = e.currentTarget.files[0];
            this.audio.src = URL.createObjectURL(file);
            // this.audio.play();
        }
        // function to maniplate audio
        this.audioTuner = function(){
            try{
            this.panner.pan.value = this.defaults.balance;
            this.bassTuner(this.source,this.audioCtx.destination);
            this.trebleTuner(this.source,this.audioCtx.destination);
            // room settings
               //____________________________________________________END setup
        // this.source.connect(this.splitter);
        // this.sound.connect(this.audioCtx.destination);
        this.splitter.connect(this.leftDelay, 0);
        this.leftDelay.connect(this.leftFeedback);

        this.leftFeedback.connect(this.rightDelay);
        this.splitter.connect(this.rightDelay, 1);

        this.rightDelay.connect(this.rightFeedback);
        this.rightFeedback.connect(this.leftDelay);
// _________________________________________INITIALS
            this.leftDelay.delayTime.value = 0;
            this.leftFeedback.gain.value = 0;
            this.rightDelay.delayTime.value = 0;
            this.rightFeedback.gain.value = 0;

        this.leftFeedback.connect(this.merger, 0, 0);
        this.rightFeedback.connect(this.merger, 0, 1);
        // this.merger.connect(this.audioCtx.destination);
        //___________________________________________BEGIN output
       
            if(this.defaults.audioCrystaliser){
                this.crystaliser();
            }
            this.analyser.fftSize = 1024;
            this.analyser.minDecibels = -70;
            this.analyser.maxDecibels = -10;
        }catch(e){
            alert(e);
        }
        }.bind(this);
// bassBoast
     // compute bass Decibels
        this.bassTuner = function(source,dest){
            // console.log(this.bass)
            this.bass.type = 'lowpass';
            this.bass.frequency.value = 55;
            this.bass.gain.value = 10;
        //    this.bassBoost();
            source.connect(this.panner);
            this.panner.connect(this.bass);
            this.bass.connect(this.analyser);
            this.analyser.connect(dest);
        }.bind(this);
       
        // compute treble Decibels
        this.trebleTuner = function(source,dest){
            this.treble.type = 'bandpass';
            this.treble.frequency.value = 2000;
            source.connect(this.treble);
            this.treble.connect(this.analyser);
            this.analyser.connect(dest);

        }.bind(this);
        this.crystaliser = function(){
            this.crystal.type = 'highpass';
            this.crystal.frequency.setValueAtTime(2000,this.audioCtx.currentTime);
            this.crystalBoost.gain.setValueAtTime(1.5,this.audioCtx.currentTime);
            this.source.connect(this.panner);
            this.panner.connect(this.crystal)
            this.crystal.connect(this.crystalBoost);
            this.crystalBoost.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
        }.bind(this);

        // timing function
        this.timeUpdate =function(){
            var sec = parseInt(this.audio.currentTime % 60);
            var min = parseInt((this.audio.currentTime / 60) % 60);

            var sc = parseInt(this.audio.duration % 60);
            var mn = parseInt((this.audio.duration / 60) % 60);

            sec < 10 ? this.settings.currentTime.textContent = min+":"+ "0"+sec: this.settings.currentTime.textContent = min+":"+sec;
            sc < 10 ? this.settings.durationTime.textContent = mn+":"+"0"+sc :this.settings.durationTime.textContent = mn+":"+sc;
        }.bind(this);
        // audio visualizer
        this.audioVisualizer = function(){
            window.requestAnimationFrame(this.audioVisualizer);
            this.analyser.getByteFrequencyData(this.frequencyDomain);
            context.clearRect(0,0,canvas.width,canvas.height);
            context.fillStyle = this.defaults.visualColor;
            for (let i = 0; i < this.byteSize; i++) {
                var element = this.frequencyDomain[i] / 200;
                var barWidth = 1;
                var barX = i * 2;
                var height = canvas.height * element;
                var barHeight = canvas.height - height - 1;
                context.fillRect(barX,barHeight,barWidth,height);
            }
        }.bind(this);
        this.verticalVisual = ()=>{
            window.requestAnimationFrame(this.verticalVisual);
            this.analyser.getByteTimeDomainData(this.frequencyDomain);
            context.clearRect(0,0,canvas.width,canvas.height);
            // context.fillStyle = this.defaults.visualColor;
            let space = canvas.width / this.analyser.frequencyBinCount;
           for (let index = 0; index < canvas.width; index++) {
               const value = this.frequencyDomain[index] / 256;
                context.beginPath();
                context.moveTo(space * index,canvas.height);
                context.lineTo(space * index,canvas.height - value)
                context.stroke();
            }

        }
        this.audioSpectrum = function(){
            window.requestAnimationFrame(this.audioSpectrum)
            this.analyser.getByteTimeDomainData(this.frequencyDomain);
            context.clearRect(0,0,canvas.width,canvas.height);
            context.fillStyle = this.defaults.visualColor;
            for (let i = 0; i < this.byteSize; i++) {
                var element = this.frequencyDomain[i] / 200;
                var specX = 1;
                var height = canvas.height * element;
                var specHeight = canvas.height - height - 1;
                context.fillRect(i * specX,specHeight,1.8,1.8);
            }
        }.bind(this);

// get audio balance
      
    }


    // JdroidFx Methods
    getAudio(){
        console.log(this.audioCtx);
        this.settings.loader.onchange = this.loadTrack;
        this.audio.onplaying = this.audioTuner;
        this.audio.ontimeupdate = this.timeUpdate;
    }
    getTrackerUpdate(selector){
       var sliderTrack = document.querySelector(selector);

     setInterval(() => {
        sliderTrack.value = this.audio.currentTime;
        sliderTrack.max = this.audio.duration;
     },500);
     sliderTrack.onchange = function(){
        this.audio.currentTime = sliderTrack.value ;

     }.bind(this);

    }
    // import multiple tracks
    getPlaylist(loader){
        document.querySelector(loader).addEventListener("change",this.files,false);
    }
    getControlButtons({play,pause,next,prev}){
        var controls = {
                play:document.querySelector(play),
                pause:document.querySelector(pause),
                next:document.querySelector(next),
                prev:document.querySelector(prev)
        };
        this.audio.playing ? this.audio.play() : this.audio.pause();
        controls.play.onclick = function(){
            this.audio.play();
            this.audioCtx.resume();
        }.bind(this);
// on paused
        this.audio.paused ? controls.pause.style.display = 'none' : controls.play.style.display = 'show';
// ended
        this.audio.ended ? controls.play.style.display = 'none':controls.pause.style.display = 'show';
// controls
        controls.pause.onclick = function(){
            this.audio.pause();
        }.bind(this);


    }
    getDefaults(){
        return this.defaults;
    }

getAudioBassBoost({
    bassBoostSelector
}){
    var bassSelector = document.querySelector(bassBoostSelector);
    var that = this;
    bassSelector.onchange = function(){
        if(this.checked){
            // alert(this.checked)
            that.bassBoost.gain.value = 3;
            that.bass.connect(that.bassBoost)
            that.bassBoost.connect(that.analyser);
        }else{
            // alert(this.checked)
            that.bassBoost.gain.value = 0;
            that.bass.disconnect(that.bassBoost)
            that.bassBoost.disconnect(that.analyser);
        }
    }
}

getCrystalizer({crystalizer}){
    var that = this;
    var crystals = document.querySelector(crystalizer);
    crystals.onchange = function(){
        switch(this.checked){
            case true:
            that.crystaliser();
            break;

            default:

            that.crystal.type = 'highpass';
                that.crystal.frequency.setValueAtTime(0,that.audioCtx.currentTime);
                that.source.disconnect(that.crystal);
                that.crystal.disconnect(that.analyser);
                that.analyser.disconnect(that.audioCtx.destination);
                break;
        }
    }
}

getFrameRate({frameRateSelector}){
    // this.analyser.smoothingTimeConstant = frame;
    var frameRate = document.querySelector(frameRateSelector);
    var label = document.querySelector("#tt");
    var that = this;
    frameRate.onchange = function(){
        that.analyser.smoothingTimeConstant = this.value;
        label.textContent = (this.value);
    }
}
getAudioVisuals({
    options
}){
    var that = this;
    var visuals = document.querySelector(options);
    visuals.addEventListener("change",function(){

        switch (this.value) {
            case "bars":
                that.audioVisualizer();
                // alert(this.value)
                break;

            case "spectrum":
                that.audioSpectrum();
                // alert(this.value)
                break;

            default:
                alert("No visualiser selected");
                console.warn("No visualiser selected");
                break;
        }
    },false);
    }
    getVolume({vol}){
        console.log(this.defaults.volume);
        var that = this;
        document.querySelector(vol).addEventListener("change",function(e){
                that.audio.volume = this.value;
        },false);
    }
    getAudioBalance({panner}){
        console.log(this.panner);
        var that = this;
        document.querySelector(panner).onchange = function(e){
            that.panner.pan.setValueAtTime(this.value,that.audioCtx.currentTime);
        }
    }
    getColorPicker({canvas,image}){
        var image = document.querySelector(image);
        var url = "./default.png";
        image.src = url;
        var canvas = document.querySelector(canvas);
        var ctx = canvas.getContext("2d");
    
        image.onload = function(){
            image.width = canvas.width;
            image.height = canvas.height;
            ctx.drawImage(image,0,0,image.width,image.height);
            var x= 115,y =126,a=92,b=112;
            var pixel = ctx.getImageData(x,y,1,1).data;
            var pl = ctx.getImageData(a,b,1,1).data;
            var color1 = "rgba("+pl[0]+","+pl[1]+","+pl[2]+")";
            var color2 = "rgba("+pixel[0]+","+pixel[1]+","+pixel[2]+")";
            var bgColor = "-webkit-radial-gradient(circle,"+color1+","+color2+")";
            document.querySelector("body").style.background = bgColor;
        }
    }
    getEQBalance(balance){
            this.panner.pan.setValueAtTime(balance,this.audioCtx.currentTime);
    }
    getGUIFrameRate(frame){
        this.analyser.smoothingTimeConstant = frame;
    }
    getEQvolume(volume){
        this.audio.volume = volume;
    }
    getEQvisuals(visuals){
        switch (visuals) {
            case "bars":
                this.audioVisualizer();
                break;

            case "spectrum":
                this.audioSpectrum();
                break;
            case "vertical-bars":
                this.verticalVisual();
                break;
            default:
                alert("No visualiser selected");
                console.warn("No visualiser selected");
                break;
        }
    }
    getEQCrystalz(crystals){
        if(crystals){
           this.crystaliser();
            // break;
        }else{
            this.crystalBoost.gain.setValueAtTime(0,this.audioCtx.currentTime);
            this.source.connect(this.panner);
            this.panner.connect(this.crystal)
            this.crystal.connect(this.crystalBoost);
            this.crystalBoost.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
        }
    }
    getEQbass(bass){
        if(bass){
            this.bassBoost.gain.value = 3;
            this.bass.connect(this.bassBoost)
            this.bassBoost.connect(this.analyser);
        }else{
            this.bassBoost.gain.value = 0;
            this.bass.disconnect(this.bassBoost)
            this.bassBoost.disconnect(this.analyser);
        }
    }
    enableAudioLoop(loop){
        this.audio.loop = loop;
    }
    enableSurround(convolve){
        if(convolve){
            this.source.connect(this.surround);
            this.surround.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
        }else{
            this.source.disconnect(this.surround);
            this.surround.disconnect(this.analyser);
            this.analyser.disconnect(this.audioCtx.destination);
        }
    }
    getEQAudioLimit(limit){
       if(limit){
        this.compressor.threshold.setValueAtTime(-60,this.audioCtx.currentTime);
        this.compressor.attack.setValueAtTime(0.7,this.audioCtx.currentTime);
        this.compressor.knee.setValueAtTime(1,this.audioCtx.currentTime);
        this.compressor.release.setValueAtTime(0.5,this.audioCtx.currentTime);
        this.compressor.ratio.setValueAtTime(12,this.audioCtx.currentTime);
        // connections
        this.source.connect(this.compressor);
        this.compressor.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
       }else{
        this.compressor.threshold.setValueAtTime(0,this.audioCtx.currentTime);
       }
       
    }
    getEQEffects(effect){
       switch (effect) {
           case 'Echo':
            this.leftDelay.delayTime.value = 0.11;
            this.leftFeedback.gain.value = 0.36;
            this.rightDelay.delayTime.value = 0.10;
            this.rightFeedback.gain.value = 0.50;
            console.info("echo")

               break;
            case 'Auditorium':
                this.leftDelay.delayTime.value = 0.06;
                this.leftFeedback.gain.value = 0.29;
                this.rightDelay.delayTime.value = 0.08;
                this.rightFeedback.gain.value = 0.35;
                console.info("auditorium")
                break;
            case 'Scene':
                this.leftDelay.delayTime.value = 0.05;
                this.leftFeedback.gain.value = 0.40;
                this.rightDelay.delayTime.value = 0.07;
                this.rightFeedback.gain.value = 0.37;
                console.info("scene")
            break;

            case 'Small-Room':
                this.leftDelay.delayTime.value = 0.03;
                this.leftFeedback.gain.value = 0.46;
                this.rightDelay.delayTime.value = 0.012;
                this.rightFeedback.gain.value = 0.51;
                console.info("small-room")
                break;
            case 'Stadium':
                this.leftDelay.delayTime.value = 0.25;
                this.leftFeedback.gain.value = 0.32;
                this.rightDelay.delayTime.value = 0.25;
                this.rightFeedback.gain.value = 0.5;
                console.info("stadium")
                break;
           default:
               console.info("No preset selected");
               break;
       }
       
    }
    enableEffects(sw){
        if (sw) {
            this.source.connect(this.splitter);
            this.merger.connect(this.audioCtx.destination);
         }else{
            this.source.disconnect(this.splitter);
            this.merger.disconnect(this.audioCtx.destination);
        }
    }
};

export{ JDroidFx  };
