import type { ClearCodeEditor } from "../editor/editor";

export class TTSController {
    private editor: ClearCodeEditor;
    private synth: SpeechSynthesis = window.speechSynthesis;
    private speaking = false;
    private rate: number = 0.95;
    private selectedVoice: SpeechSynthesisVoice | null = null;

    constructor(editor: ClearCodeEditor) {
        this.editor = editor;
        // Voice load sync in some browsers
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = this.synth.getVoices();
            if (!this.selectedVoice && voices.length > 0) {
                this.selectedVoice = voices[0] ?? null;
            }
        };
    }

    getVoices(): SpeechSynthesisVoice[] {
        return this.synth.getVoices();
    }

    setVoice(voiceURI: string): void {
        const voices = this.synth.getVoices();
        this.selectedVoice = voices.find(v => v.voiceURI == voiceURI) ?? null;
    }

    setRate(rate: number): void {
        this.rate = rate;
    }

    getRate(): number {
        return this.rate;
    }

    speak(text?: string): void {
        const content = text ?? this.editor.getContent();
        if (!content.trim()) return;

        this.stop();
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.rate = this.rate;
        if (this.selectedVoice) utterance.voice = this.selectedVoice;
        utterance.onstart = () => { this.speaking = true; };
        utterance.onend = () => { this.speaking = false; };
        this.synth.speak(utterance);
    }

    stop(): void {
        if (this.synth.speaking) this.synth.cancel();
        this.speaking = false;
    }

    isSpeaking(): boolean {
        return this.speaking;
    }
}