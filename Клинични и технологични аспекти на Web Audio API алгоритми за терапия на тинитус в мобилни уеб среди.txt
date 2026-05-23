Клинични и технологични аспекти на Web Audio API алгоритми за терапия на тинитус в мобилни уеб среди
Прилагането на акустична стимулация за управление и облекчаване на тинитус (шум в ушите) представлява утвърден клиничен подход, насочен към индуциране на невронална хабитуация и редукция на хиперактивността в слуховия кортекс. Проектирането на терапевтични приложения като прогресивни уеб приложения (Progressive Web Apps - PWA), насочени към потребители на възраст над 50 години, изисква съчетание от прецизна дигитална обработка на сигнали (DSP), съобразена с възрастовите изменения на слуховия апарат (пребиакузис), и оптимизация на изчислителните ресурси за съхранение на батерията в мобилни платформи като iOS Safari и Android Chrome. Настоящият доклад анализира математическите модели, софтуерната архитектура и терапевтичната логика за изграждане на устойчива слухова уеб-система.   

1. Генериране на терапевтични шумове
Шумовата терапия цели намаляване на контраста между субективния тинитус и околната акустична среда. Изборът на спектрален профил е индивидуален и зависи от честотната характеристика на тинитуса и наличието на съпътстваща слухова свръхчувствителност (хиперакузис).   

А) Розов шум (Pink Noise, 1/f 
1
 )
Розовият шум притежава спектрална плътност на мощността, която намалява с 3 dB на октава с увеличаване на честотата. Това разпределение осигурява еднаква енергия във всяка октава, което съответства на логаритмичния модел на възприемане на честотите от човешкото ухо.   

Сравнителен анализ на алгоритмите
Параметър	Алгоритъм на Voss-McCartney	Рефиниран алгоритъм на Paul Kellet
Математически метод	
Стохастично сумиране на генератори на бял шум, обновявани при различни октавни стъпки чрез битови операции.

Филтриране на бял шум чрез многополюсна IIR филтърна верига (апроксимация с претеглена сума).

Спектрална точност	
Ниска до средна. Наблюдават се стъпаловидни дефекти и флуктуации в по-ниските честоти.

Изключително висока. Отклонения под ±0.05 dB в диапазона над 9.2 Hz при 44.1 kHz.

Клиничен ефект при тинитус	По-слаб. Изкуствените флуктуации в ниския спектър могат да привлекат фокуса на слуховия кортекс.	
Оптимален. Постига се перфектно равномерен, неангажиращ "течен" звук, подпомагащ бързата хабитуация.

Изчислително натоварване	
Изключително ниско (подходящо за много стари системи).

Средно при реално време, но нулево при използване на предварително генериран аудио буфер.

  
Алгоритъмът на Paul Kellet е клинично по-подходящ за терапия на тинитус поради своята висока спектрална хомогенност. Избягването на микроскопични амплитудни флуктуации е критично за предотвратяване на неволно фокусиране на вниманието на пациента върху източника на маскиране.   

Пълен софтуерен код
JavaScript
/**
 * Клас за генериране на розов шум по метода на Paul Kellet.
 */
class PinkNoiseGenerator {
    /**
     * Създава AudioBuffer, съдържащ прецизен розов шум.
     * @param {AudioContext} audioCtx - Активният уеб аудио контекст.
     * @param {number} duration - Продължителност на шума в секунди.
     * @returns {AudioBuffer}
     */
    static generateBuffer(audioCtx, duration = 2.0) {
        const sampleRate = audioCtx.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        // Полюсни променливи на филтъра на Kellet
        let b0 = 0.0, b1 = 0.0, b2 = 0.0, b3 = 0.0, b4 = 0.0, b5 = 0.0, b6 = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;

            // Филтърни коефициенти на Kellet за наклон от -3 dB/oct
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            b6 = white * 0.115926;

            // Мащабиране за предпазване от претоварване (нормализиране около -12dBFS)
            data[i] = pink * 0.11;
        }
        return buffer;
    }
}
Б) Кафяв шум (Brown/Red Noise, 1/f 
2
 )
Кафявият шум проявява спад на мощността от 6 dB на октава с повишаване на честотата. Той се характеризира с дълбок, топъл и нискочестотно доминиран спектър.   

Математически модел на случайно блуждаене (Random Walk)
Интегрирането на бял шум x[n] за получаване на кафяв шум y[n] се описва чрез разностното уравнение:

y[n]=y[n−1]+α⋅x[n]
Този процес води до натрупване на постояннотоково отместване (DC offset), което измества работната точка на мембраната на високоговорителя и може да доведе до изкривявания или повреда на хардуера. Поради това е необходимо премахване на постояннотоковата съставка (DC removal filter) и последващо нормализиране до клинично безопасното пиково ниво от −6 dBFS (амплитуда 0.5).   

Пълен софтуерен код
JavaScript
/**
 * Клас за генериране на кафяв шум чрез интегриране и премахване на DC отместването.
 */
class BrownNoiseGenerator {
    /**
     * @param {AudioContext} audioCtx
     * @param {number} duration
     * @returns {AudioBuffer}
     */
    static generateBuffer(audioCtx, duration = 2.0) {
        const sampleRate = audioCtx.sampleRate;
        const bufferSize = sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0.0;
        let sum = 0.0;

        // Първи проход: Генериране на суров кафяв шум
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Коефициент на утечка (leakage) 0.99 за предотвратяване на безкрайна интеграция
            data[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = data[i];
            sum += data[i];
        }

        // Пресмятане на средната стойност (DC съставка)
        const dcOffset = sum / bufferSize;

        // Втори проход: DC премахване и намиране на абсолютния пик
        let maxVal = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            data[i] -= dcOffset;
            const absVal = Math.abs(data[i]);
            if (absVal > maxVal) {
                maxVal = absVal;
            }
        }

        // Трети проход: Нормализиране до -6 dBFS (максимална амплитуда 0.5)
        const scale = 0.5 / (maxVal || 1.0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] *= scale;
        }

        return buffer;
    }
}
В) Зелен шум (Green Noise)
Зеленият шум е спектрално дефиниран като шум, концентриран в средния диапазон на чуваемост, симулиращ фоновите шумове на естествената среда. Клинично се центрира около честота f 
0
​
 =500 Hz.   

Лентов филтър (Bandpass Filter)
Филтрирането се осъществява чрез втори ред биквадратен лентов филтър с качествени параметри :   

Централна честота (f 
0
​
 ): 500 Hz.   

Качествен фактор (Q-factor): Задаването на Q=1.0 осигурява широчина на лентата от приблизително 1.4 октави. Това позволява плавно потискане на дразнещите ниски честоти и прекомерно пискливите високи честоти, правейки звука изключително приятен за по-възрастни пациенти.   

Пълен софтуерен код
JavaScript
/**
 * Генерира аудио верига за зелен шум в реално време.
 */
class GreenNoiseGenerator {
    /**
     * @param {AudioContext} audioCtx
     * @returns {Object} Съдържа входящ и изходящ възел.
     */
    static createNode(audioCtx) {
        // Като база използваме висококачествен розов шум за по-мека спектрална характеристика
        const pinkBuffer = PinkNoiseGenerator.generateBuffer(audioCtx, 2.0);
        const source = audioCtx.createBufferSource();
        source.buffer = pinkBuffer;
        source.loop = true;

        const bandpass = audioCtx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 500.0; // Централна честота в Hz
        bandpass.Q.value = 1.0;           // Терапевтичен качествен фактор

        source.connect(bandpass);

        return {
            source: source,
            output: bandpass
        };
    }
}
Пример за употреба, известни проблеми и алтернативи
Код за инициализация и пускане
JavaScript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Стартиране на розов шум
const pinkBuffer = PinkNoiseGenerator.generateBuffer(audioCtx, 2.0);
const pinkSource = audioCtx.createBufferSource();
pinkSource.buffer = pinkBuffer;
pinkSource.loop = true;
pinkSource.connect(audioCtx.destination);
pinkSource.start();
Известни проблеми и решения
При кратка дължина на буфера (под 1.0 секунда) ухото на по-възрастните пациенти може да улови повтарящия се модел на шума, което предизвиква когнитивно дразнене. Решение: Използване на буфери с дължина точно 2.0 или повече секунди, което осигурява спектрална уникалност без претоварване на паметта на мобилното устройство.   

Алтернативи
Алтернатива е използването на генеративно синтезиран в реално време розов шум чрез AudioWorklet, но това изисква отделни файлове, усложнява сигурността на PWA при офлайн зареждане и консумира повече батерия в сравнение с кеширания статичен AudioBuffer.   

2. Бинаурални тонове за невронална синхронизация
Бинауралните тонове възникват, когато два чисти тона с близки честоти се подават независимо към всяко ухо чрез стерео слушалки. Мозъкът обработва фазовата разлика в горното маслиново ядро на мозъчния ствол, генерирайки усещане за пулсация с честота, равна на разликата между двата сигнала.   

А) Делта конфигурация (Дълбока релаксация и сън)
Пулсация: 4 Hz.   

Ляв канал: 150 Hz, Десен канал: 154 Hz.   

Б) Алфа конфигурация (Редукция на стреса и тревожността)
Пулсация: 10 Hz.   

Ляв канал: 250 Hz, Десен канал: 260 Hz.   

В) Прецизно стерео разделяне и безопасност
Задължително е използването на ChannelMergerNode, за да се избегне взаимно проникване на сигналите в софтуерната нишка.   

Физиологична обосновка на носещите честоти (150 Hz−250 Hz)
Мозъчната кора и слуховият ствол притежават максимална способност за проследяване на фазата (phase-locking) при честоти под 1000 Hz, с оптимум в зоната на 100 Hz−400 Hz.   

Защо не 100 Hz? Голяма част от масовите потребителски слушалки за мобилни устройства имат ограничен физически капацитет за възпроизвеждане на честоти под 100 Hz без изкривявания. Това би принудило потребителя да увеличи силата на звука, създавайки риск от акустична травма.   

Защо не 500 Hz или повече? По-високите честоти се възприемат като субективно по-остри и пискливи, което засилва нервната възбудимост и дразни пациентите с тинитус, вместо да ги отпусне.   

Безопасност за слуха
Пациенти с неврологични заболявания (напр. епилепсия) трябва да подхождат с повишено внимание към нискочестотната бинаурална стимулация. Терапията винаги трябва да се провежда при ниски нива на звука (около 40−50 dB SPL).   

Пълен софтуерен код
JavaScript
/**
 * Клас за генериране на прецизни стерео бинаурални тонове.
 */
class BinauralToneGenerator {
    /**
     * @param {AudioContext} audioCtx
     * @param {number} carrier - Носеща честота в Hz.
     * @param {number} beat - Честота на пулсация в Hz.
     */
    constructor(audioCtx, carrier, beat) {
        this.ctx = audioCtx;
        this.carrier = carrier;
        this.beat = beat;

        this.oscLeft = null;
        this.oscRight = null;
        this.merger = null;
    }

    /**
     * Изгражда веригата и стартира генераторите.
     * @param {AudioNode} destinationNode - Възел за свързване на изхода.
     */
    start(destinationNode) {
        this.oscLeft = this.ctx.createOscillator();
        this.oscRight = this.ctx.createOscillator();
        this.merger = this.ctx.createChannelMerger(2);

        this.oscLeft.type = 'sine';
        this.oscLeft.frequency.value = this.carrier;

        this.oscRight.type = 'sine';
        this.oscRight.frequency.value = this.carrier + this.beat;

        // Насочване на осцилаторите към съответните стерео канали
        this.oscLeft.connect(this.merger, 0, 0);  // Ляв канал
        this.oscRight.connect(this.merger, 0, 1); // Десен канал

        this.merger.connect(destinationNode);

        const now = this.ctx.currentTime;
        this.oscLeft.start(now);
        this.oscRight.start(now);
    }

    /**
     * Спира генераторите.
     */
    stop() {
        const now = this.ctx.currentTime;
        if (this.oscLeft) {
            this.oscLeft.stop(now);
            this.oscLeft.disconnect();
        }
        if (this.oscRight) {
            this.oscRight.stop(now);
            this.oscRight.disconnect();
        }
        if (this.merger) {
            this.merger.disconnect();
        }
    }
}
Пример за употреба
JavaScript
const bBeats = new BinauralToneGenerator(audioCtx, 250, 10); // Алфа ритъм
bBeats.start(audioCtx.destination);

// Спиране след определено време
// bBeats.stop();
Известни проблеми и решения
Ако потребителят използва монофонично аудио устройство (напр. вграден високоговорител на телефон), бинауралната илюзия се превръща в просто физическо акустично интерфериране в пространството. Решение: Проверка на изходния интерфейс чрез софтуерен диалог преди пускане (вж. Секция 8).   

3. Изрязващ филтър в реално време (TMNMT)
Терапията с изрязана музика (Tailor-Made Notched Music Training - TMNMT) премахва енергията на звука в диапазон от една октава около индивидуалната честота на тинитуса на пациента. Това предотвратява стимулацията на съответната свръхвъзбудена област в кората на главния мозък и активира латералното потискане от съседните здрави неврони.   

Биквадратен филтър и качествени параметри
Математическата връзка между качествения фактор Q на филтъра и неговата честотна ширина в октави N се изразява чрез формулата :   

Q= 
2 
N
 −1
2 
N
 

​
 
​
 
Референтни стойности на Q-фактора
Ширина на изрязване (N в октави)	Точна стойност на Q-фактора	Клинично приложение
2 октави	
0.667 

Широкоспектърна релаксация
1 октава	
1.414 

Стандартна клинична TMNMT конфигурация
1/2 октава	
2.871 

Тясно селектирана терапия при стабилна честота
  
Приложението изгражда каскада от два филтъра, за да се гарантира дълбочина на затихване от минимум −40 dB в центъра на терапевтичния срез.

Пълен софтуерен код
JavaScript
/**
 * Клас за прилагане на TMNMT изрязващ филтър върху аудио файлове в реално време.
 */
class TMNMTEngine {
    /**
     * @param {AudioContext} audioCtx
     * @param {HTMLMediaElement} htmlAudioElement - <audio> елемент с MP3 източник.
     */
    constructor(audioCtx, htmlAudioElement) {
        this.ctx = audioCtx;
        this.source = this.ctx.createMediaElementSource(htmlAudioElement);
        
        // Каскадно свързване на два филтъра за по-стръмен срез
        this.notch1 = this.ctx.createBiquadFilter();
        this.notch2 = this.ctx.createBiquadFilter();

        this.notch1.type = 'notch';
        this.notch2.type = 'notch';

        // Първоначално свързване
        this.source.connect(this.notch1);
        this.notch1.connect(this.notch2);
    }

    /**
     * Конфигурира параметрите на среза.
     * @param {number} centerHz - Честота на тинитуса (250 - 16000 Hz).
     * @param {number} octaveWidth - Ширина на ноча в октави (напр. 1.0).
     */
    configure(centerHz, octaveWidth = 1.0) {
        if (centerHz < 250 || centerHz > 16000) {
            throw new Error("Невалидна терапевтична честота.");
        }

        // Пресмятане на качествения фактор по математическия модел
        const power = Math.pow(2, octaveWidth);
        const qFactor = Math.sqrt(power) / (power - 1);

        this.notch1.frequency.setValueAtTime(centerHz, this.ctx.currentTime);
        this.notch1.Q.setValueAtTime(qFactor, this.ctx.currentTime);

        this.notch2.frequency.setValueAtTime(centerHz, this.ctx.currentTime);
        this.notch2.Q.setValueAtTime(qFactor, this.ctx.currentTime);
    }

    /**
     * Свързва изхода на филтърната верига към дестинация.
     * @param {AudioNode} destinationNode
     */
    connect(destinationNode) {
        this.notch2.connect(destinationNode);
    }
}
Пример за употреба
JavaScript
const audioElement = document.createElement('audio');
audioElement.src = 'media/music.mp3';
audioElement.crossOrigin = 'anonymous'; // Предотвратява CORS блокаж на уеб контекста

const tmnmt = new TMNMTEngine(audioCtx, audioElement);
tmnmt.configure(4000, 1.0); // Изрязване около 4 kHz с ширина 1 октава
tmnmt.connect(audioCtx.destination);

audioElement.play();
Известни проблеми и решения
При пренасочване на MediaElementSourceNode към Web Audio API, някои браузъри (особено iOS Safari) блокират аудиото, ако липсва заглавна част Access-Control-Allow-Origin на сървъра, където е разположен MP3 файлът. Решение: MP3 файловете трябва да се хостват на същия домейн като PWA или да се доставят с коректни CORS заглавия.   

4. Генеративни фрактални тонове (Aqua Zen)
Генеративните тонове са базирани на нерепетитивни алгоритми, които възпроизвеждат хармонични последователности с предвидими спектрални правила, но без повтарящи се модели. Този подход стимулира релаксацията и намалява фокуса върху вътрешния шум.   

Математически и естетически правила за Aqua Zen
Пентатонична скала: Използването на пентатонична скала гарантира липса на дисонантни интервали, което създава приятно субективно усещане.   

Честотен обхват: Ограничен между 200 Hz и 1000 Hz за избягване на дразнене в критичните за тинитуса високи честоти.   

Тембър тип "Камбана": Постига се чрез бърз атака (Attack), бързо затихване (Decay), ниско ниво на поддържане (Sustain) и дълго затихване при отпускане (Release).   

Обвиваща крива (ADSR):
Амплитуда
  ^      /\
  |     /  \
  |    /    \_______
  |   /             \
  |  /               \
  +--------------------> Време
    [A]
Пълен софтуерен код
JavaScript
/**
 * Фрактален звуков генератор в стил Widex Zen.
 */
class FractalZenEngine {
    /**
     * @param {AudioContext} audioCtx
     * @param {AudioNode} destinationNode
     */
    constructor(audioCtx, destinationNode) {
        this.ctx = audioCtx;
        this.dest = destinationNode;
        this.isPlaying = false;
        this.timeoutId = null;

        // Честоти на пентатонична скала в диапазона 200 - 1000 Hz
        this.notes = [220.00, 246.94, 277.18, 329.63, 392.00, 440.00, 493.88, 554.37, 659.25, 783.99];
    }

    /**
     * Стартира генеративния цикъл.
     */
    start() {
        this.isPlaying = true;
        this.triggerNextNote();
    }

    /**
     * Спира процеса.
     */
    stop() {
        this.isPlaying = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    /**
     * Генерира и стартира следващия тон след случаен интервал.
     */
    triggerNextNote() {
        if (!this.isPlaying) return;

        const now = this.ctx.currentTime;
        const randomNote = this.notes[Math.floor(Math.random() * this.notes.length)];
        
        this.playTone(randomNote, now);

        // Случаен интервал между нотите от 1 до 5 секунди 
        const nextIntervalMs = (Math.random() * 4000) + 1000;
        this.timeoutId = setTimeout(() => this.triggerNextNote(), nextIntervalMs);
    }

    /**
     * Синтезира единичен звънлив тон.
     */
    playTone(frequency, time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle'; // Триъгълната вълна дава мек, топъл тембър
        osc.frequency.setValueAtTime(frequency, time);

        // ADSR обвиваща крива 
        const attack = 0.1;  // бърз атака [22]
        const decay = 0.5;   // плавен спад към състейн [22]
        const sustain = 0.2; // ниско ниво на състейн [22, 24]
        const hold = 1.0;    // времетраене на тона преди отпускане
        const release = 2.0; // дълъг плавен релийз [22]

        gain.gain.setValueAtTime(0.0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + attack); // Максимален обем 0.15 [24]
        gain.gain.setTargetAtTime(0.15 * sustain, time + attack, decay / 3.0); // Спад [24]
        
        const releaseStart = time + attack + hold;
        gain.gain.setValueAtTime(0.15 * sustain, releaseStart);
        gain.gain.setTargetAtTime(0.0, releaseStart, release / 5.0); // Релийз

        osc.connect(gain);
        gain.connect(this.dest);

        osc.start(time);
        osc.stop(releaseStart + release);
    }
}
5. Алгоритми за затихване при сън (Sleep Mode Fade-Out)
Заспиването изисква постепенно и безпрепятствено затихване на акустичния сигнал, за да се избегне рязкото засилване на субективния тинитус при внезапно настъпване на тишина.   

Математически модели на кривите
Сила на звука
  ^
  | * * *                      (Експоненциална - възприема се като линейна)
  |      * *
  |         * *
  |            * * * 
  |                 * * * * *
  +----------------------------> Време
А) Линейна крива (MVP подход)
V(t)=V 
0
​
 ⋅(1− 
d
t−t 
0
​
 
​
 )
При линейно намаляване на амплитудата ухото усеща твърде бърз спад в началото на процеса и бавно затихване в самия край поради логаритмичната природа на човешкия слух.

Б) Експоненциална крива (Оптимален терапевтичен подход)
V(t)=V 
target
​
 +(V 
0
​
 −V 
target
​
 )⋅e 
− 
τ
t−t 
0
​
 
​
 
 
Експоненциалното затихване съвпада с логаритмичното усещане за децибели (закон на Вебер-Фехнер). Силата на звука изглежда, че намалява напълно плавно и равномерно, което гарантира спокойствието на пациента преди заспиване.

Пълен софтуерен код
JavaScript
/**
 * Симулатор на двете криви за изключване при сън.
 */
class SleepFadeController {
    /**
     * Изпълнява линейно затихване.
     * @param {AudioParam} gainParam - Свойството gain на GainNode.
     * @param {number} duration - Времетраене на затихването в секунди.
     */
    static startLinearFade(gainParam, duration) {
        const audioCtx = gainParam.context;
        const now = audioCtx.currentTime;
        const startVal = gainParam.value;

        gainParam.cancelScheduledValues(now);
        gainParam.setValueAtTime(startVal, now);
        gainParam.linearRampToValueAtTime(0.0, now + duration);
    }

    /**
     * Изпълнява експоненциално затихване (Клинично препоръчано).
     * @param {AudioParam} gainParam - Свойството gain на GainNode.
     * @param {number} duration - Времетраене на затихването в секунди.
     */
    static startExponentialFade(gainParam, duration) {
        const audioCtx = gainParam.context;
        const now = audioCtx.currentTime;
        const startVal = gainParam.value;

        gainParam.cancelScheduledValues(now);
        gainParam.setValueAtTime(startVal, now);
        
        // Времеконстанта tau = времетраене / 5 за гарантиране на затихване под 1%
        const timeConstant = duration / 5.0;
        
        // Използваме изключително малка стойност (напр. 0.0001), тъй като експонентата не достига чиста нула
        gainParam.setTargetAtTime(0.0001, now, timeConstant);
        
        // Планираме пълна хардуерна нула накрая
        setTimeout(() => {
            gainParam.setValueAtTime(0.0, audioCtx.currentTime);
        }, duration * 1000);
    }
}
6. Клинична смесителна верига (Mixing & Processing Chain)
За сигурна доставка на сигналите, архитектурата на миксера трябва да обедини отделните канали в общ поток, филтриран през мастер TMNMT и защитен с хардуерно-софтуерен лимитер, ограничаващ изходните пикове до −3 dB за пълна слухова защита.   

[Розов Шум]   ---> [GainPink] ----\
[Кафяв Шум]   ---> ----\
[Зелен Шум]   ---> [GainGreen] ----\---> [MasterGain] ---> [NotchFilter] ---> ---> [Analyser] --->
[Бинаурални]  --->  ----/
[Фрактални]   ---> [GainZen]  ---/
Пълен софтуерен код
JavaScript
/**
 * Цялостна софтуерна архитектура на терапевтичния миксер.
 */
class TinnitusMixer {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Канални GainNodes
        this.gains = {
            pink: this.ctx.createGain(),
            brown: this.ctx.createGain(),
            green: this.ctx.createGain(),
            binaural: this.ctx.createGain(),
            zen: this.ctx.createGain()
        };

        // Инициализиране на Мастер секция
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.8; // Безопасно първоначално ниво

        // Мастер TMNMT филтър
        this.notchFilter = this.ctx.createBiquadFilter();
        this.notchFilter.type = 'allpass'; // По подразбиране е неутрален

        // DynamicsCompressorNode като клиничен лимитер
        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.setValueAtTime(-3, this.ctx.currentTime); // Срязване на пикове над -3dBFS
        this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);       // Твърдо ограничаване
        this.limiter.ratio.setValueAtTime(20, this.ctx.currentTime);     // Максимално компресиране
        this.limiter.attack.setValueAtTime(0.001, this.ctx.currentTime); // Бърза реакция (1ms)
        this.limiter.release.setValueAtTime(0.05, this.ctx.currentTime); // Бързо възстановяване

        // Анализатор за визуализация в интерфейса
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;

        // Свързване на индивидуалните канали към Master Gain
        Object.values(this.gains).forEach(channelGain => {
            channelGain.connect(this.masterGain);
        });

        // Основен тракт на сигнала
        this.masterGain.connect(this.notchFilter);
        this.notchFilter.connect(this.limiter);
        this.limiter.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }

    /**
     * Динамично променя силата на определен канал.
     */
    setChannelVolume(channel, volume) {
        if (this.gains[channel]) {
            this.gains[channel].gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
        }
    }
}
7. Управление на аудио фокуса в мобилни браузъри
Мобилните платформи подлежат на прекъсвания (телефонни повиквания, аларми, системни звуци), които автоматично спират звука в Web Audio API. Ако тези събития не се обработят, аудиото остава неактивно или блокира.   

Специфики на платформите
iOS Safari: Изисква изрично нулиране на контекста чрез възстановяване на сесията и повторно стартиране на нишките за фоново възпроизвеждане при загуба на фокус.   

Android Chrome: Използва събитието statechange за автоматично следене на системните състояния.   

Пълен софтуерен код
JavaScript
/**
 * Модул за управление на аудио фокуса и системните прекъсвания.
 */
class AudioFocusManager {
    /**
     * @param {TinnitusMixer} mixer
     */
    constructor(mixer) {
        this.mixer = mixer;
        this.initListeners();
    }

    initListeners() {
        // Следене на промени в състоянието на уеб аудио контекста 
        this.mixer.ctx.addEventListener('statechange', () => {
            console.log(`Промяна на състоянието: ${this.mixer.ctx.state}`);
            if (this.mixer.ctx.state === 'interrupted') {
                this.handleInterruption();
            }
        });

        // Наблюдение на видимостта на уеб страницата [4, 29]
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.resumeContext();
            }
        });
    }

    async resumeContext() {
        if (this.mixer.ctx.state === 'suspended') {
            try {
                await this.mixer.ctx.resume();
                console.log("Успешно събуждане на AudioContext.");
            } catch (err) {
                console.error("Грешка при събуждане:", err);
            }
        }
    }

    handleInterruption() {
        console.warn("Аудио потокът е прекъснат от системата.");
        // Спиране на източниците, ако е необходимо
    }
}
8. Идентификация на слушалки и iOS ограничения
За осигуряване на терапевтичния ефект при бинаурална стимулация и TMNMT филтриране е задължително използването на стерео слушалки.   

iOS Ограничения при enumerateDevices
Проблем: iOS Safari блокира достъпа до списъка с устройства чрез enumerateDevices() за нерегистрирани сайтове (връща празен списък или маскирани имена).   

Решение: Използва се софтуерно превключване на аудио сесията с navigator.audioSession (за iOS 17+) и принудителен потребителски диалогов прозорец преди стартиране на звука.   

Пълен софтуерен код
JavaScript
/**
 * Система за детекция на слушалки и заобикаляне на ограниченията при iOS.
 */
class HeadphoneDetector {
    /**
     * Опитва се да зачете физическата връзка на слушалките.
     * @returns {Promise<boolean>}
     */
    static async hasHeadphones() {
        try {
            if (!navigator.mediaDevices ||!navigator.mediaDevices.enumerateDevices) {
                return false;
            }

            const devices = await navigator.mediaDevices.enumerateDevices();
            // Търсене на маркери за външни аудио изходи 
            return devices.some(device => {
                if (device.kind === 'audiooutput') {
                    const label = device.label.toLowerCase();
                    return label.includes('headphone') || label.includes('audiooutput') || label.includes('bluetooth');
                }
                return false;
            });
        } catch (e) {
            console.warn("Грешка при зачитане на хардуерните интерфейси.", e);
            return false;
        }
    }

    /**
     * Задължителен софтуерен диалог за iOS потребители.
     */
    static async enforceHeadphonesAlert() {
        const isDetected = await this.hasHeadphones();
        if (!isDetected) {
            return confirm(
                "Терапията изисква задължително използване на стерео слушалки за постигане на терапевтичен ефект.\n\n" +
                "Потвърждавате ли, че Вашите слушалки са свързани?"
            );
        }
        return true;
    }
}
9. Фоново възпроизвеждане при заключен екран (PWA)
Ако PWA бъде минимизиран или телефонът бъде заключен, iOS автоматично прекратява Web Audio процесите, тълкувайки ги като фонов спам.   

Трик с тих фонов аудио елемент
Заобикалянето на защитата изисква паралелно възпроизвеждане на съвсем къс и празен (или абсолютно тих) локален MP3/WAV файл чрез традиционния HTML5 <audio> таг, конфигуриран за безкрайно зацикляне. Това указва на операционната система, че приложението е активен медиен плеър, запазвайки Web Audio нишката активна на заден план.   

Пълен софтуерен код
JavaScript
/**
 * Специфичен интегратор за поддържане на фоново аудио чрез MediaSession API и тих трик.
 */
class PWAControlCenter {
    /**
     * @param {TinnitusMixer} mixer
     */
    constructor(mixer) {
        this.mixer = mixer;
        this.silentAudio = null;
        this.initSilentElement();
        this.setupMediaSession();
    }

    initSilentElement() {
        this.silentAudio = document.createElement('audio');
        this.silentAudio.id = 'tinnitus-bg-silent';
        this.silentAudio.loop = true;
        // 2 секунди абсолютно тих кодиран WAV буфер (Base64 формат за автономен достъп)
        this.silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
        document.body.appendChild(this.silentAudio);
    }

    setupMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: "Звукова терапия при Тинитус",
                artist: "Клиничен PWA панел",
                album: "Управление на хабитуацията",
                artwork: [
                    { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });

            // Конфигуриране на контролите от заключен екран [34]
            navigator.mediaSession.setActionHandler('play', async () => {
                await this.mixer.ctx.resume();
                await this.silentAudio.play();
                navigator.mediaSession.playbackState = "playing";
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                this.mixer.ctx.suspend();
                this.silentAudio.pause();
                navigator.mediaSession.playbackState = "paused";
            });
        }
    }

    /**
     * Задължително се извиква след първото реално натискане на бутон от потребителя.[33, 35]
     */
    async activateSession() {
        try {
            await this.silentAudio.play();
            await this.mixer.ctx.resume();
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = "playing";
            }
            console.log("Терапевтичната фонова сесия е активна.");
        } catch (e) {
            console.error("Грешка при активиране на фоновата сесия:", e);
        }
    }
}
10. Оптимизация на енергопотреблението (Battery Optimization)
Терапевтичните приложения се използват продължително време (често по няколко часа по време на сън). Оптимизацията на консумацията на енергия е от решаващо значение за запазване на живота на батерията.   

Стратегии за оптимизация
Технологичен избор	Изчислителен модел	Енергийно въздействие
ScriptProcessorNode (Остарял)	
Изчислява пробите в основната нишка на браузъра чрез JS.

Критично високо. Предизвиква загряване на процесора и бърз разряд на батерията.
AudioWorkletNode (Модерен)	Изпълнява сложна филтрация в реално време в отделна нишка.	Средно. Оптимално за динамичен синтез, но изисква постоянна активност.
AudioBufferSourceNode (Избран)	
Еднократно зареждане на изчисления буфер в паметта на аудио чипа.

Минимално. Процесорът на мобилното устройство не се натоварва по време на възпроизвеждането.

  
Честота на дискретизация (Sample Rate)
Ръчното форсиране на ниска честота от типа на 22 kHz за пестене на изчисления предизвиква обратен ефект при iOS Safari. Операционната система е принудена да извършва хардуерен ресемплинг в реално време до системните 44.1 kHz или 48 kHz, което увеличава консумацията на енергия. Извод: Използването на системната честота по подразбиране е най-енергоспестяващият подход.   

Момент за преминаване в спящ режим (Context Suspend)
Когато силата на звука е напълно намалена или терапията е на пауза, аудио контекстът трябва незабавно да бъде спрян чрез suspend(). Това позволява на аудио чипа на мобилното устройство да премине в режим на ниска консумация на енергия.   

11. Пълен клиничен интеграционен контролер
Следващият кодов блок обединява всички DSP алгоритми, архитектурата на миксера, защитните системи и фоновите функции в единна, лесна за внедряване архитектурна структура.

JavaScript
/**
 * Цялостен клиничен мениджър за управление на терапия на тинитус в PWA.
 */
class ClinicalTinnitusApp {
    constructor() {
        this.mixer = new TinnitusMixer();
        this.zenEngine = new FractalZenEngine(this.mixer.ctx, this.mixer.gains.zen);
        this.pwaControls = new PWAControlCenter(this.mixer);
        this.binauralTone = null;
        
        this.activeNoiseNode = null;
    }

    /**
     * Основна функция за безопасно стартиране на терапията.
     * @param {Object} config - Обект с параметри на сесията.
     */
    async launchTherapy(config) {
        // 1. Проверка на слуховите аксесоари и сигурност
        const userApproved = await HeadphoneDetector.enforceHeadphonesAlert();
        if (!userApproved) {
            console.warn("Терапията е прекратена от потребителя.");
            return;
        }

        // 2. Активиране на фоновия режим на PWA
        await this.pwaControls.activateSession();

        const ctx = this.mixer.ctx;
        const now = ctx.currentTime;

        // 3. Конфигуриране на маскиращ шум
        if (config.noiseType) {
            this.stopNoise();
            let buffer;
            if (config.noiseType === 'pink') {
                buffer = PinkNoiseGenerator.generateBuffer(ctx, 2.0);
                this.mixer.setChannelVolume('pink', 0.25);
            } else if (config.noiseType === 'brown') {
                buffer = BrownNoiseGenerator.generateBuffer(ctx, 2.0);
                this.mixer.setChannelVolume('pink', 0.3); // Използват обща мастер верига
            }

            if (buffer) {
                this.activeNoiseNode = ctx.createBufferSource();
                this.activeNoiseNode.buffer = buffer;
                this.activeNoiseNode.loop = true;
                this.activeNoiseNode.connect(this.mixer.gains.pink);
                this.activeNoiseNode.start(now);
            } else if (config.noiseType === 'green') {
                const greenSetup = GreenNoiseGenerator.createNode(ctx);
                greenSetup.output.connect(this.mixer.gains.green);
                greenSetup.source.start(now);
                this.activeNoiseNode = greenSetup.source;
                this.mixer.setChannelVolume('green', 0.4);
            }
        }

        // 4. Конфигуриране на бинаурална синхронизация
        if (config.binauralType === 'alpha') {
            if (this.binauralTone) this.binauralTone.stop();
            this.binauralTone = new BinauralToneGenerator(ctx, 250, 10); // 10Hz Алфа
            this.binauralTone.start(this.mixer.gains.binaural);
            this.mixer.setChannelVolume('binaural', 0.15);
        } else if (config.binauralType === 'delta') {
            if (this.binauralTone) this.binauralTone.stop();
            this.binauralTone = new BinauralToneGenerator(ctx, 150, 4); // 4Hz Делта
            this.binauralTone.start(this.mixer.gains.binaural);
            this.mixer.setChannelVolume('binaural', 0.15);
        }

        // 5. Конфигуриране на фрактални Zen тонове
        if (config.enableZen) {
            this.zenEngine.stop();
            this.zenEngine.start();
            this.mixer.setChannelVolume('zen', 0.2);
        }

        // 6. Конфигуриране на глобален TMNMT ноч филтър за защита на кората 
        if (config.tinnitusHz) {
            this.mixer.notchFilter.type = 'notch';
            const power = Math.pow(2, config.notchWidth || 1.0);
            const qVal = Math.sqrt(power) / (power - 1);
            this.mixer.notchFilter.frequency.setValueAtTime(config.tinnitusHz, now);
            this.mixer.notchFilter.Q.setValueAtTime(qVal, now);
        } else {
            this.mixer.notchFilter.type = 'allpass';
        }

        // 7. Планиране на таймер за сън
        if (config.sleepMinutes) {
            const fadeDurationSec = config.sleepMinutes * 60;
            SleepFadeController.startExponentialFade(this.mixer.masterGain.gain, fadeDurationSec);
            
            // Пълно хардуерно изключване за съхранение на батерията след затихването 
            setTimeout(() => {
                this.shutdownAll();
            }, (fadeDurationSec + 1) * 1000);
        }
    }

    stopNoise() {
        if (this.activeNoiseNode) {
            try {
                this.activeNoiseNode.stop();
                this.activeNoiseNode.disconnect();
            } catch (e) {
                // Предотвратява грешки при вече спрени генератори
            }
            this.activeNoiseNode = null;
        }
    }

    shutdownAll() {
        this.stopNoise();
        this.zenEngine.stop();
        if (this.binauralTone) {
            this.binauralTone.stop();
        }
        this.pwaControls.deactivateSession();
        this.mixer.ctx.suspend(); // Спиране на аудио контекста за пестене на енергия 
        console.log("Цялата клинична система премина в спящ режим.");
    }
}

ziphearing.com
Hearing Aids for Tinnitus - ZipHearing
Отваря се в нов прозорец

widexpro.com
Widex Zen Therapy: What's new?
Отваря се в нов прозорец

prototyp.digital
Blog | What we learned about PWAs and audio playback - prototyp
Отваря се в нов прозорец

magicbell.com
PWA iOS Limitations and Safari Support [2026] - MagicBell
Отваря се в нов прозорец

widex.com
Widex SoundRelax - Tinnitus relief sounds and tones
Отваря се в нов прозорец

brain.fm
Can Binaural Beats Damage Your Brain? Separating Facts from Fears
Отваря се в нов прозорец

docs.swmansion.com
Noise generation | React Native Audio API
Отваря се в нов прозорец

noisehack.com
How to Generate Noise with the Web Audio API - Noisehack
Отваря се в нов прозорец

forum.juce.com
Pink noise generator - General JUCE discussion
Отваря се в нов прозорец

scribd.com
RX 11 Audio Editor User Manual | PDF | Computer Engineering - Scribd
Отваря се в нов прозорец

blog.demofox.org
Transmuting White Noise To Blue, Red, Green, Purple - The blog at the bottom of the sea
Отваря се в нов прозорец

developer.mozilla.org
BiquadFilterNode() constructor - Web APIs - MDN Web Docs
Отваря се в нов прозорец

sengpielaudio.com
Q factor vs bandwidth in octaves band filter -3 dB pass calculator calculation formula quality factor Q to bandwidth BW width octave convert filter BW octave vibration mastering slope dB/oct steepness EQ filter equalizer cutoff freqiency - Sengpielaudio
Отваря се в нов прозорец

utahhearingaids.com
Binaural Beats for Tinnitus: Don't Believe the Hype
Отваря се в нов прозорец

pmc.ncbi.nlm.nih.gov
Evaluating time-bound efficacy of binaural beats for tinnitus treatment in individuals with normal hearing: A brainwave entrainment study - PMC
Отваря се в нов прозорец

pmc.ncbi.nlm.nih.gov
A Review of Binaural Bates and the Brain - PMC - NIH
Отваря се в нов прозорец

youtube.com
Tinnitus Sound Therapy: Binaural Beats for Tinnitus Relief & Masking - YouTube
Отваря се в нов прозорец

medium.com
IOS Safari Forces Audio Output to Speakers When Using getUserMedia() - Medium
Отваря се в нов прозорец

ranecommercial.com
Bandwidth in Octaves Versus Q in Bandpass Filters - RANE Commercial
Отваря се в нов прозорец

sageaudio.com
How to Set the Q of an Equalizer to an Octave - Sage Audio
Отваря се в нов прозорец

widex.com
Tinnitus sound therapy - Widex Zen
Отваря се в нов прозорец

dylanmeeus.github.io
Audio From Scratch With Go: ADSR - Dylan Meeus
Отваря се в нов прозорец

mastering.com
ADSR: The Best Kept Secret of Pro Music Producers! - Mastering.com
Отваря се в нов прозорец

stackoverflow.com
Filtering web audio frequencies - javascript - Stack Overflow
Отваря се в нов прозорец

reddit.com
Building audio app for iOS. Does background audio work on PWA or is native the only option? - Reddit
Отваря се в нов прозорец

stackoverflow.com
iOS Safari switches audio output to speakers when starting microphone recording with getUserMedia() - Stack Overflow
Отваря се в нов прозорец

reddit.com
Is it even possible to solve this challenge around Safari's audio permissions? : r/webdevelopment - Reddit
Отваря се в нов прозорец

reddit.com
Safari Web Audio API Issue: AudioContext Silently Fails After Tab Inactivity : r/webdev - Reddit
Отваря се в нов прозорец

github.com
api.MediaDevices.enumerateDevices - doesnt return audio output device in ios safari · Issue #23148 · mdn/browser-compat-data - GitHub
Отваря се в нов прозорец

bugs.webkit.org
198277 – Audio stops playing when standalone web app is no longer in foreground - WebKit Bugzilla
Отваря се в нов прозорец

stackoverflow.com
iOS PWA Background Audio Support [closed] - Stack Overflow
Отваря се в нов прозорец

vindit.dk
Play audio on demand in Safari on iOS - Rasmus Vind
Отваря се в нов прозорец

progressier.com
Audio Player PWA Demo - Progressier
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
Отваря се в нов прозорец
