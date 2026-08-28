import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  X, 
  Check, 
  Eye, 
  RefreshCw, 
  Trophy, 
  Maximize2, 
  Crop, 
  ZoomIn, 
  Move,
  Layers,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export interface ImagePresetItem {
  name: string;
  url: string;
  tag: string;
}

export const TOURNAMENT_IMAGE_PRESETS: ImagePresetItem[] = [
  {
    name: 'Tucunaré Azul & Amarelo',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&auto=format&fit=crop&q=80',
    tag: 'Tucunaré'
  },
  {
    name: 'Tucunaré Açú Troféu',
    url: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=1000&auto=format&fit=crop&q=80',
    tag: 'Açú'
  },
  {
    name: 'Robalos no Manguezal',
    url: 'https://images.unsplash.com/photo-1541944743827-e04aa6427c33?w=1000&auto=format&fit=crop&q=80',
    tag: 'Costeiro / Robalo'
  },
  {
    name: 'Fly Fishing & Black Bass',
    url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1000&auto=format&fit=crop&q=80',
    tag: 'Black Bass / Fly'
  },
  {
    name: 'Gigantes de Couro & Pintado',
    url: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=1000&auto=format&fit=crop&q=80',
    tag: 'Pintado / Jaú'
  },
  {
    name: 'Pesca Noturna & Caiaque',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1000&auto=format&fit=crop&q=80',
    tag: 'Caiaque'
  },
  {
    name: 'Dourado do Rio & Corredeiras',
    url: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=1000&auto=format&fit=crop&q=80',
    tag: 'Dourado'
  },
  {
    name: 'Lago & Represa ao Pôr do Sol',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    tag: 'Natureza'
  }
];

interface TournamentCoverImageEditorProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  tournamentTitle?: string;
}

export type FitMode = 'cover' | 'fit-blur' | 'fit-black';
export type VerticalAlign = 'center' | 'top' | 'bottom';

export const TournamentCoverImageEditor: React.FC<TournamentCoverImageEditorProps> = ({
  imageUrl,
  setImageUrl,
  tournamentTitle = 'Título do Campeonato'
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState<string>(imageUrl.startsWith('http') ? imageUrl : '');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Raw image source before canvas 16:9 framing (for re-adjusting zoom / framing live)
  const [rawImageSource, setRawImageSource] = useState<string | null>(
    imageUrl.startsWith('data:') ? imageUrl : null
  );
  const [fitMode, setFitMode] = useState<FitMode>('cover');
  const [verticalAlign, setVerticalAlign] = useState<VerticalAlign>('center');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = 100%, up to 2 = 200%

  // Effective display image
  const currentBanner = imageUrl || TOURNAMENT_IMAGE_PRESETS[0].url;

  // Render raw image into exact 16:9 (1200x675) canvas with selected fitMode, align and zoom
  const renderTo16by9Canvas = useCallback((
    src: string,
    mode: FitMode,
    vAlign: VerticalAlign,
    zoom: number
  ) => {
    setIsProcessingFile(true);
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const TARGET_WIDTH = 1200;
      const TARGET_HEIGHT = 675; // 16:9 ratio exactly

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessingFile(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const imgW = img.width;
      const imgH = img.height;

      if (mode === 'fit-blur') {
        // Draw blurred background covering entire canvas
        ctx.save();
        ctx.filter = 'blur(20px) brightness(0.5)';
        // Draw slightly oversized to prevent transparent edges from blur
        const bgScale = Math.max(TARGET_WIDTH / imgW, TARGET_HEIGHT / imgH) * 1.15;
        const bgW = imgW * bgScale;
        const bgH = imgH * bgScale;
        const bgX = (TARGET_WIDTH - bgW) / 2;
        const bgY = (TARGET_HEIGHT - bgH) / 2;
        ctx.drawImage(img, bgX, bgY, bgW, bgH);
        ctx.restore();

        // Dark overlay on background for contrast
        ctx.fillStyle = 'rgba(10, 15, 25, 0.45)';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        // Draw crisp original image fitted inside 16:9
        const scale = Math.min(TARGET_WIDTH / imgW, TARGET_HEIGHT / imgH) * zoom;
        const renderW = imgW * scale;
        const renderH = imgH * scale;
        const posX = (TARGET_WIDTH - renderW) / 2;
        let posY = (TARGET_HEIGHT - renderH) / 2;

        if (vAlign === 'top') posY = 0;
        else if (vAlign === 'bottom') posY = TARGET_HEIGHT - renderH;

        // Add subtle shadow to foreground image
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 24;
        ctx.drawImage(img, posX, posY, renderW, renderH);
      } else if (mode === 'fit-black') {
        // Black background
        ctx.fillStyle = '#080a0f';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        const scale = Math.min(TARGET_WIDTH / imgW, TARGET_HEIGHT / imgH) * zoom;
        const renderW = imgW * scale;
        const renderH = imgH * scale;
        const posX = (TARGET_WIDTH - renderW) / 2;
        let posY = (TARGET_HEIGHT - renderH) / 2;

        if (vAlign === 'top') posY = 0;
        else if (vAlign === 'bottom') posY = TARGET_HEIGHT - renderH;

        ctx.drawImage(img, posX, posY, renderW, renderH);
      } else {
        // COVER 16:9 mode (default & recommended)
        const baseScale = Math.max(TARGET_WIDTH / imgW, TARGET_HEIGHT / imgH);
        const scale = baseScale * zoom;
        const renderW = imgW * scale;
        const renderH = imgH * scale;
        const posX = (TARGET_WIDTH - renderW) / 2;
        
        let posY = (TARGET_HEIGHT - renderH) / 2;
        if (vAlign === 'top') {
          posY = 0;
        } else if (vAlign === 'bottom') {
          posY = TARGET_HEIGHT - renderH;
        }

        ctx.drawImage(img, posX, posY, renderW, renderH);
      }

      // Convert to high-quality compressed JPEG
      const final16by9Url = canvas.toDataURL('image/jpeg', 0.88);
      setImageUrl(final16by9Url);
      setIsProcessingFile(false);
    };

    img.onerror = () => {
      setUploadError('Erro ao renderizar imagem na proporção correta 16:9.');
      setIsProcessingFile(false);
    };

    img.src = src;
  }, [setImageUrl]);

  // Read uploaded file and initialize 16:9 framing
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    setUploadError('');
    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawSrc = e.target?.result as string;
      setRawImageSource(rawSrc);
      // Automatically process and frame to 16:9
      renderTo16by9Canvas(rawSrc, fitMode, verticalAlign, zoomLevel);
    };
    reader.onerror = () => {
      setUploadError('Falha ao ler o arquivo.');
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // Re-render when framing options change
  const handleUpdateFraming = (newMode: FitMode, newAlign: VerticalAlign, newZoom: number) => {
    setFitMode(newMode);
    setVerticalAlign(newAlign);
    setZoomLevel(newZoom);
    if (rawImageSource) {
      renderTo16by9Canvas(rawImageSource, newMode, newAlign, newZoom);
    } else if (imageUrl.startsWith('http')) {
      renderTo16by9Canvas(imageUrl, newMode, newAlign, newZoom);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setUploadError('Informe um link válido.');
      return;
    }
    setUploadError('');
    setRawImageSource(trimmed);
    renderTo16by9Canvas(trimmed, fitMode, verticalAlign, zoomLevel);
  };

  const handleResetToDefault = () => {
    setImageUrl('');
    setRawImageSource(null);
    setCustomUrlInput('');
    setUploadError('');
    setFitMode('cover');
    setVerticalAlign('center');
    setZoomLevel(1);
  };

  return (
    <div className="bg-[#181a1f] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header with Title and Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ImageIcon className="h-4 w-4" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Capa Oficial do Campeonato (Proporção 16:9)
            </h4>
          </div>
          <p className="text-xs text-slate-400">
            A imagem é ajustada automaticamente na proporção <strong>16:9 widescreen</strong> para não distorcer, achatar ou cortar em nenhum dispositivo.
          </p>
        </div>

        {imageUrl && (
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer self-start sm:self-center"
          >
            <X className="h-3.5 w-3.5" />
            <span>Restaurar Padrão</span>
          </button>
        )}
      </div>

      {/* Live 16:9 Aspect Ratio Preview Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-emerald-400" />
            <span>Pré-visualização da Capa (Exatamente como aparecerá no Card):</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 border border-slate-800 font-bold">
            📐 16:9 Widescreen
          </span>
        </div>

        {/* 16:9 CONTAINER MATCHING TOURNAMENT CARD */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 w-full aspect-[16/9] shadow-2xl group">
          <img
            src={currentBanner}
            alt="Capa do Campeonato"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />

          {/* Gradients matching card */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

          {/* Badge top-left */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 shadow-lg flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span>Capa 16:9</span>
            </span>
            {imageUrl.startsWith('data:') ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-500/40 backdrop-blur-sm">
                Enviada & Proporcionada
              </span>
            ) : imageUrl ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-sm">
                Link Externo
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700 backdrop-blur-sm">
                Modelo da Galeria
              </span>
            )}
          </div>

          {/* Title Overlay in Banner Preview */}
          <div className="absolute bottom-3 left-4 right-4 z-10 space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
              CAMPEONATO OFICIAL
            </span>
            <h3 className="text-sm sm:text-lg font-black text-white truncate drop-shadow-md">
              {tournamentTitle || 'Nome do Campeonato'}
            </h3>
          </div>
        </div>
      </div>

      {/* SMART ENQUADRAMENTO / PROPORÇÃO CONTROLS (WHEN A CUSTOM IMAGE IS LOADED) */}
      {(rawImageSource || imageUrl.startsWith('data:')) && (
        <div className="p-4 bg-slate-950/90 rounded-2xl border border-emerald-500/30 space-y-3 animate-fade-in shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase text-slate-200">
                Ajuste de Enquadramento & Proporção da Foto
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Personalize o corte e o foco
            </span>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleUpdateFraming('cover', verticalAlign, zoomLevel)}
              className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                fitMode === 'cover'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Crop className="h-4 w-4 shrink-0" />
              <div>
                <span className="text-xs block">Preencher 16:9 (Ideal)</span>
                <span className="text-[10px] text-slate-400 block">Recorta e preenche sem bordas</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleUpdateFraming('fit-blur', verticalAlign, zoomLevel)}
              className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                fitMode === 'fit-blur'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4 shrink-0" />
              <div>
                <span className="text-xs block">Foto Inteira (Sem Cortes)</span>
                <span className="text-[10px] text-slate-400 block">Fundo suave nas laterais</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleUpdateFraming('fit-black', verticalAlign, zoomLevel)}
              className={`p-2.5 rounded-xl text-left border transition flex items-center gap-2 cursor-pointer ${
                fitMode === 'fit-black'
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="h-4 w-4 shrink-0" />
              <div>
                <span className="text-xs block">Foto Inteira (Fundo Escuro)</span>
                <span className="text-[10px] text-slate-400 block">Bordas escuras neutras</span>
              </div>
            </button>
          </div>

          {/* Alignment & Zoom Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Vertical Alignment */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                <Move className="h-3 w-3 text-emerald-400" />
                <span>Alinhamento do Foco:</span>
              </label>
              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateFraming(fitMode, 'top', zoomLevel)}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer font-medium ${
                    verticalAlign === 'top' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Topo
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFraming(fitMode, 'center', zoomLevel)}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer font-medium ${
                    verticalAlign === 'center' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Centro
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateFraming(fitMode, 'bottom', zoomLevel)}
                  className={`flex-1 py-1.5 text-xs rounded-lg transition cursor-pointer font-medium ${
                    verticalAlign === 'bottom' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Base
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-slate-400 block flex items-center gap-1">
                  <ZoomIn className="h-3 w-3 text-emerald-400" />
                  <span>Zoom / Escala:</span>
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min="1"
                  max="1.8"
                  step="0.05"
                  value={zoomLevel}
                  onChange={(e) => handleUpdateFraming(fitMode, verticalAlign, parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector Options Tabs */}
      <div className="space-y-3">
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Galeria de Sugestões ({TOURNAMENT_IMAGE_PRESETS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Enviar do Meu Dispositivo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>Link / URL da Imagem</span>
          </button>
        </div>

        {uploadError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <X className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* TAB 1: PRESET GALLERY */}
        {activeTab === 'presets' && (
          <div className="space-y-2 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {TOURNAMENT_IMAGE_PRESETS.map((preset, idx) => {
                const isSelected = (imageUrl === preset.url) || (!imageUrl && idx === 0);
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setImageUrl(preset.url);
                      setRawImageSource(null);
                      setUploadError('');
                    }}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      isSelected
                        ? 'border-emerald-500 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full aspect-[16/9] overflow-hidden bg-slate-950">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-2 flex flex-col justify-end">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block truncate">
                        {preset.tag}
                      </span>
                      <span className="text-xs font-bold text-white truncate block">
                        {preset.name}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-slate-950 p-1 rounded-full shadow">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: FILE UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-3 animate-fade-in">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:border-emerald-500/50 hover:text-slate-200'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                {isProcessingFile ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs sm:text-sm font-bold text-white">
                  {isProcessingFile ? 'Processando proporção 16:9...' : 'Clique para selecionar foto ou arraste aqui'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Fotos horizontais, quadradas ou verticais são convertidas e enquadradas automaticamente em <strong>16:9</strong>.
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Procurar no Computador / Celular
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM URL */}
        {activeTab === 'url' && (
          <div className="space-y-3 animate-fade-in bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <label className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Cole o Link Direto da Imagem (URL HTTPS):
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/minha-imagem.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 bg-[#121316] border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer shadow-md shrink-0"
              >
                Aplicar e Enquadrar
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              O link será carregado e ajustado para o formato 16:9 de alta fidelidade.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentCoverImageEditor;
