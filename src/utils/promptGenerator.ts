export type MediaType = 'app_game' | 'presentation' | 'module' | 'video_script' | 'quiz' | 'tts_feature';

export type ToneKey = 'fun' | 'formal' | 'storytelling' | 'simple';

export type EducationalPhase = 'fase_a' | 'fase_b' | 'fase_c' | 'umum';

export type SubjectType = 'ipas' | 'bahasa_indonesia' | 'matematika' | 'pancasila' | 'bahasa_inggris' | 'lainnya';

export interface PromptInput {
  topic: string;
  audience: string;
  phase?: EducationalPhase;
  subject?: SubjectType;
  mediaType: MediaType;
  objective?: string;
  tone: ToneKey;
  extra?: string;
}

export const phaseLabels: Record<EducationalPhase, string> = {
  fase_a: 'Fase A (Kelas 1 - 2 SD)',
  fase_b: 'Fase B (Kelas 3 - 4 SD)',
  fase_c: 'Fase C (Kelas 5 - 6 SD)',
  umum: 'Umum / Terbuka (SD Kelas 1 - 6)',
};

export const subjectLabels: Record<SubjectType, string> = {
  ipas: 'IPAS (Ilmu Pengetahuan Alam & Sosial)',
  bahasa_indonesia: 'Bahasa Indonesia',
  matematika: 'Matematika',
  pancasila: 'Pendidikan Pancasila',
  bahasa_inggris: 'Bahasa Inggris',
  lainnya: 'Mata Pelajaran Lain / Muatan Lokal',
};

export const toneDescriptions: Record<ToneKey, string> = {
  fun: 'menyenangkan, interaktif, memancing rasa ingin tahu, dan menggunakan bahasa yang akrab/ramah',
  formal: 'formal, akademis, menggunakan tata bahasa baku, dan terstruktur dengan rapi',
  storytelling: 'berbasis penceritaan (storytelling) dengan studi kasus atau karakter fiktif untuk memudahkan pemahaman',
  simple: 'sangat sederhana, dijelaskan langkah demi langkah (step-by-step), menggunakan kalimat pendek dan mudah dicerna',
};

export const mediaInstructions: Record<MediaType, string> = {
  tts_feature: `
[INSTRUKSI FORMAT OUTPUT: FITUR TEXT-TO-SPEECH (TTS) INTERAKTIF UNTUK MPI]
- Bertindaklah sebagai Senior EdTech Web Developer dan Spesialis Aksesibilitas Pembelajaran.
- Buatkan kode fitur Text-to-Speech (TTS) lengkap, modular, dan siap pakai untuk Media Pembelajaran Interaktif (MPI) menggunakan Web Speech API (window.speechSynthesis).
- Fitur WAJIB memenuhi 5 spesifikasi teknis berikut:
  1) BAR KONTROL AUDIO:
     - Tombol Play (Putar), Pause (Jeda), dan Stop (Berhenti) dengan ikon modern.
     - Indikator status audio (Idle, Sedang Membaca, Dijeda).
     - Desain ramah siswa (student-friendly) dengan tombol besar dan feedback visual jelas.
  2) BAHASA & KECEPATAN (SPEECH RATE):
     - Voice default Bahasa Indonesia (id-ID) dengan deteksi otomatis suara Bahasa Indonesia terbaik di browser.
     - Kontrol kecepatan bicara yang mudah diakses: 0.8x (Lambat/fokus), 1.0x (Normal), dan 1.2x (Cepat).
  3) SOROTAN TEKS REAL-TIME (TEXT HIGHLIGHTING):
     - Berikan efek highlight/sorotan warna kuning lembut (bg-amber-100 / border-b-2) pada kalimat atau kata yang sedang dibacakan secara real-time.
     - Siswa dapat mengikuti alur bacaan dengan mudah tanpa kehilangan jejak.
  4) BACA OTOMATIS BERTAHAP & PEMBERSIHAN TAG:
     - Pembacaan sistematis: mulai dari Judul Materi lalu berlanjut ke isi paragraf atau poin-poin penjelasan.
     - Bersihkan elemen HTML (seperti <b>, <i>, <button>, tag visual) sehingga HANYA teks murni yang dibacakan tanpa kesalahan lafal tag.
  5) MANAJEMEN STATE & CLEANUP:
     - Otomatis panggil window.speechSynthesis.cancel() ketika berganti halaman submateri, berpindah tab, atau menutup modal.
     - Tangani jeda (pause) dan lanjutkan (resume) secara konsisten di semua peramban (Chrome, Edge, Firefox, Safari).
- Berikan output dalam format:
  A) Kode Komponen Mandiri (HTML, CSS Tailwind, dan JavaScript murni).
  B) Panduan 3 Langkah Cara Memasang ke Proyek MPI (Drop-in integration guide).
`,
  app_game: `
[INSTRUKSI FORMAT OUTPUT: APLIKASI WEB CANVAS]
- Bertindaklah sebagai Full-Stack Developer Media Pembelajaran.
- Hasilkan kode aplikasi web (HTML, CSS, dan JavaScript) dalam SATU FILE HTML tunggal (Single-file).
- Jangan memisahkan file CSS atau JS. Gunakan Tailwind CSS (melalui CDN) untuk styling.
- Pastikan UI/UX tampak modern, menarik untuk audiens target, dan responsif (berfungsi baik di HP maupun Laptop).
- Berikan elemen interaktif atau gamifikasi ringan (misalnya: sistem skor, drag & drop, tombol klik interaktif, atau animasi sederhana) agar belajar tidak membosankan.
- Pastikan tidak ada bug, dan kode bisa langsung dijalankan secara mandiri.
`,
  presentation: `
[INSTRUKSI FORMAT OUTPUT: OUTLINE PRESENTASI (CANVA/SLIDES)]
- Buatkan struktur materi yang dipecah per-slide (misalnya: Slide 1, Slide 2, dst).
- Untuk setiap slide, wajib cantumkan: 
  1) Judul Slide yang menarik.
  2) Poin-poin utama (Bullet points) teks yang ringkas dan padat (jangan terlalu banyak teks panjang).
  3) Saran Visual: Ide gambar, ikon, atau layout yang bagus untuk dicari dan ditempatkan di Canva (misal: "Gambar ilustrasi anak memegang bumi").
- Tambahkan catatan kaki untuk pembicara (Speaker Notes) di bawah setiap slide.
`,
  module: `
[INSTRUKSI FORMAT OUTPUT: MODUL/DOKUMEN]
- Format hasil akhirnya sebagai dokumen berstruktur rapi menggunakan Markdown.
- Gunakan Heading (H1, H2, H3), *bold*, dan *italic* dengan tepat untuk memudahkan pembacaan (skimming).
- Sertakan bagian-bagian berikut: 
  1) Pendahuluan & Apersepsi (Mengaitkan dengan pengetahuan awal).
  2) Uraian Materi Inti (dibagi menjadi sub-bab).
  3) Contoh Kasus / Aplikasi di dunia nyata.
  4) Rangkuman / Kesimpulan.
  5) 3-5 Pertanyaan Pemantik untuk diskusi.
`,
  video_script: `
[INSTRUKSI FORMAT OUTPUT: NASKAH VIDEO PEMBELAJARAN]
- Buatkan naskah video pembelajaran dengan format dua kolom atau terstruktur: [VISUAL] dan [AUDIO / VOICEOVER].
- Tentukan durasi estimasi video (misalnya: 3-5 menit).
- Bagian [VISUAL] harus menjelaskan apa yang terlihat di layar (misal: "Animasi pop-up teks besar", "Transisi zoom-in ke gambar planet").
- Bagian [AUDIO] adalah teks yang akan dibacakan oleh narator/pengisi suara.
- Pastikan pembukaan (hook) di 10 detik pertama sangat menarik perhatian audiens.
`,
  quiz: `
[INSTRUKSI FORMAT OUTPUT: KUIS INTERAKTIF]
- Buatkan set asesmen formatif yang terdiri dari minimal 5 pertanyaan.
- Format soal harus bervariasi (Pilihan Ganda, Benar/Salah, dan Isian Singkat).
- YANG PALING PENTING: Untuk setiap soal dan pilihan jawaban, berikan umpan balik (feedback) yang konstruktif. 
  - Jika jawaban benar: Mengapa itu benar?
  - Jika jawaban salah: Jelaskan konsep yang benar tanpa langsung menghakimi.
- Jika berbentuk kode, buatkan mini-web app untuk kuis ini dalam satu file HTML.
`,
};

export const EXAMPLE_DATA: PromptInput = {
  topic: 'Konsep Dasar Tata Surya (Planet-planet dan Karakteristiknya)',
  audience: 'Siswa SMP Kelas 7',
  mediaType: 'app_game',
  objective: 'Siswa dapat mengurutkan planet dari yang terdekat dengan matahari dan menyebutkan 1 ciri khas masing-masing planet.',
  tone: 'fun',
  extra: 'Buatkan UI bertema luar angkasa (warna gelap, ada bintang-bintang). Gunakan emoji planet.',
};

export const EXAMPLE_TTS_DATA: PromptInput = {
  topic: 'Fitur Text-to-Speech (TTS) Narasi Suara dan Penyorotan Kalimat Otomatis untuk MPI',
  audience: 'Siswa Sekolah Dasar (SD) & Pengembang MPI',
  mediaType: 'tts_feature',
  objective: 'Menyediakan modul pemutar suara interaktif berbahasa Indonesia (id-ID) dengan kontrol Play/Pause/Stop, pilihan kecepatan 0.8x-1.2x, dan penyorotan teks aktif (text highlight) agar siswa dapat mendengarkan sekaligus membaca materi secara sinkron.',
  tone: 'fun',
  extra: 'Sertakan tombol kontrol audio yang modern, pastikan tag HTML tidak ikut terbaca, dan suara otomatis mati (cancel) saat navigasi berpindah.',
};

export function validatePromptInput(topic: string, audience: string): { isValid: boolean; errorMessage?: string } {
  const trimmedTopic = topic.trim();
  const trimmedAudience = audience.trim();
  if (!trimmedTopic || !trimmedAudience) {
    return {
      isValid: false,
      errorMessage: "Mohon isi 'Topik Materi' dan 'Target Audiens' terlebih dahulu untuk menghasilkan prompt yang akurat.",
    };
  }
  return { isValid: true };
}

export function generatePromptText(input: PromptInput): string {
  const topic = input.topic.trim();
  const audience = input.audience.trim();
  const objective = input.objective?.trim() || '';
  const toneKey = input.tone;
  const extra = input.extra?.trim() || '';
  const mediaType = input.mediaType;
  const phaseText = input.phase ? phaseLabels[input.phase] : 'Kurikulum Merdeka SD (Fase A/B/C)';
  const subjectText = input.subject ? subjectLabels[input.subject] : 'IPAS / Terpadu';

  let finalPrompt = `Anda adalah seorang Ahli Desain Instruksional (Instructional Designer) dan Pengembang Multimedia Pembelajaran Interaktif (MPI) tingkat lanjut berbasis Kurikulum Merdeka di Indonesia.\n\n`;
  finalPrompt += `Tugas Anda adalah merancang dan menghasilkan media pembelajaran interaktif berkualitas tinggi dengan spesifikasi berikut:\n`;
  finalPrompt += `🔹 Topik Materi: ${topic}\n`;
  finalPrompt += `🔹 Target Audiens: ${audience}\n`;
  finalPrompt += `🔹 Kurikulum & Fase: Kurikulum Merdeka - ${phaseText}\n`;
  finalPrompt += `🔹 Mata Pelajaran: ${subjectText}\n`;

  if (objective) {
    finalPrompt += `🔹 Tujuan Pembelajaran: ${objective}\n`;
  }

  const toneText = toneDescriptions[toneKey] || toneDescriptions.fun;
  finalPrompt += `🔹 Gaya Bahasa: Gunakan gaya penyampaian yang ${toneText}.\n\n`;

  finalPrompt += `📌 3 PILAR UTAMA MEDIA PEMBELAJARAN INTERAKTIF (WAJIB TERPENUHI):\n`;
  finalPrompt += `1. EKSPLORASI KONSEP: Sajikan bahasa ramah anak dengan struktur Apersepsi (pertanyaan pemantik kehidupan nyata), Konsep Inti, dan Rangkuman Poin Penting.\n`;
  finalPrompt += `2. SIMULASI INTERAKTIF: Sertakan mekanisme aktivitas langsung (slider, tombol aksi, drag-and-drop, atau eksperimen virtual) dengan reaksi visual dan feedback edukatif.\n`;
  finalPrompt += `3. ASESMEN FORMATIF TERKORELASI: Sajikan soal latihan C1-C4 yang 100% selaras dengan materi dan simulasi di atas, dilengkapi opsi pengecoh masuk akal serta pembahasan edukatif.\n\n`;

  if (extra) {
    finalPrompt += `🔹 Catatan/Instruksi Tambahan dari saya: ${extra}\n\n`;
  }

  const mediaText = mediaInstructions[mediaType] || mediaInstructions.app_game;
  finalPrompt += mediaText;

  return finalPrompt;
}

/**
 * Returns complete, production-ready source code for the requested Web Speech API TTS component.
 * Can be directly embedded into any interactive learning media project.
 */
export function getReadyToUseTTSCode(): string {
  return `<!-- ========================================================
     MODUL TEXT-TO-SPEECH (TTS) INTERAKTIF EDUZONE MPI
     Created by: ANDRIAN, S.S.Gr.
     Fitur: Play/Pause/Stop, id-ID, 0.8x-1.2x, Text Highlighting
     ======================================================== -->

<div id="eduzone-tts-module" class="w-full max-w-3xl mx-auto my-6 p-5 bg-white rounded-2xl shadow-lg border border-indigo-100">
  <!-- Bar Kontrol Audio -->
  <div class="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-200">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
        </svg>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 text-sm">Narator Suara Siswa</h4>
        <p id="tts-status" class="text-xs text-gray-500 font-medium">Siap membacakan materi</p>
      </div>
    </div>

    <!-- Tombol Audio & Pengatur Kecepatan -->
    <div class="flex items-center gap-2">
      <button id="tts-btn-play" onclick="eduzoneTTS.play()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"/></svg> Putar
      </button>
      <button id="tts-btn-pause" onclick="eduzoneTTS.pause()" class="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all hidden">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5 4h3v12H5zm7 0h3v12h-3z"/></svg> Jeda
      </button>
      <button id="tts-btn-stop" onclick="eduzoneTTS.stop()" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg flex items-center gap-1.5 transition-all">
        <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M4 4h12v12H4z"/></svg> Berhenti
      </button>

      <!-- Selector Kecepatan -->
      <select id="tts-rate-select" onchange="eduzoneTTS.setRate(this.value)" class="ml-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 bg-gray-50 text-gray-700 outline-none cursor-pointer">
        <option value="0.8">0.8x (Lambat)</option>
        <option value="1.0" selected>1.0x (Normal)</option>
        <option value="1.2">1.2x (Cepat)</option>
      </select>
    </div>
  </div>

  <!-- Area Konten Pembelajaran yang Disorot Otomatis -->
  <article id="tts-content-area" class="prose max-w-none text-gray-700 leading-relaxed">
    <h2 class="text-xl font-extrabold text-indigo-900 mb-2 tts-sentence">
      Mengenal Ekosistem dan Rantai Makanan
    </h2>
    <p class="mb-3 tts-sentence">
      Ekosistem adalah hubungan timbal balik yang tidak terpisahkan antara makhluk hidup dengan lingkungan sekitarnya.
    </p>
    <p class="mb-3 tts-sentence">
      Di dalam ekosistem terdapat produsen seperti tumbuhan hijau yang menghasilkan makanan sendiri melalui proses fotosintesis.
    </p>
    <p class="tts-sentence">
      Konsumen seperti kelinci dan rusa memakan tumbuhan, kemudian karnivora memangsa hewan herbivora untuk menjaga keseimbangan alam.
    </p>
  </article>
</div>

<style>
  /* Efek Sorotan Teks EduZone */
  .tts-highlight {
    background-color: #fef08a !important; /* Kuning lembut */
    color: #1e1b4b !important;
    border-radius: 4px;
    padding: 2px 4px;
    box-shadow: 0 0 0 2px #fde047;
    transition: all 0.2s ease-in-out;
  }
</style>

<script>
  // Controller Modular Web Speech API EduZone
  const eduzoneTTS = (function () {
    let currentSentenceIndex = 0;
    let sentences = [];
    let rate = 1.0;
    let isPaused = false;
    let isPlaying = false;

    function initSentences() {
      const container = document.getElementById('tts-content-area');
      if (!container) return;
      sentences = Array.from(container.querySelectorAll('.tts-sentence'));
    }

    function clearHighlights() {
      sentences.forEach(el => el.classList.remove('tts-highlight'));
    }

    function updateStatus(text) {
      const el = document.getElementById('tts-status');
      if (el) el.textContent = text;
    }

    function setButtonsState(state) {
      const btnPlay = document.getElementById('tts-btn-play');
      const btnPause = document.getElementById('tts-btn-pause');
      if (!btnPlay || !btnPause) return;

      if (state === 'playing') {
        btnPlay.classList.add('hidden');
        btnPause.classList.remove('hidden');
      } else {
        btnPlay.classList.remove('hidden');
        btnPause.classList.add('hidden');
      }
    }

    function speakCurrentSentence() {
      if (currentSentenceIndex >= sentences.length) {
        stop();
        updateStatus('Selesai membacakan materi.');
        return;
      }

      clearHighlights();
      const currentEl = sentences[currentSentenceIndex];
      currentEl.classList.add('tts-highlight');
      currentEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Ambil teks murni, singkirkan karakter formatting
      const textToRead = currentEl.innerText.trim();
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = rate;

      // Pilih suara Bahasa Indonesia jika tersedia
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = function () {
        if (!isPlaying || isPaused) return;
        currentSentenceIndex++;
        speakCurrentSentence();
      };

      utterance.onerror = function (e) {
        console.warn('TTS Event Error:', e);
        stop();
      };

      updateStatus(\`Membaca bagian \${currentSentenceIndex + 1} dari \${sentences.length}...\`);
      window.speechSynthesis.speak(utterance);
    }

    return {
      play: function () {
        if (!('speechSynthesis' in window)) {
          alert('Maaf, peramban Anda belum mendukung Web Speech API.');
          return;
        }

        if (isPaused) {
          window.speechSynthesis.resume();
          isPaused = false;
          isPlaying = true;
          setButtonsState('playing');
          updateStatus('Melanjutkan pembacaan...');
          return;
        }

        window.speechSynthesis.cancel();
        initSentences();
        if (sentences.length === 0) return;

        currentSentenceIndex = 0;
        isPlaying = true;
        isPaused = false;
        setButtonsState('playing');
        speakCurrentSentence();
      },

      pause: function () {
        if (isPlaying && !isPaused) {
          window.speechSynthesis.pause();
          isPaused = true;
          setButtonsState('paused');
          updateStatus('Audio dijeda.');
        }
      },

      stop: function () {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        isPlaying = false;
        isPaused = false;
        currentSentenceIndex = 0;
        clearHighlights();
        setButtonsState('stopped');
        updateStatus('Audio dihentikan.');
      },

      setRate: function (newRate) {
        rate = parseFloat(newRate) || 1.0;
        if (isPlaying && !isPaused) {
          // Restart kalimat saat ini dengan kecepatan baru
          window.speechSynthesis.cancel();
          speakCurrentSentence();
        }
      }
    };
  })();

  // Lifecycle Cleanup: hentikan suara saat pengguna navigasi atau ganti halaman
  window.addEventListener('beforeunload', () => eduzoneTTS.stop());
</script>`;
}
