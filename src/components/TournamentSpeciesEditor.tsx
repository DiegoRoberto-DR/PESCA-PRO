import React, { useState } from 'react';
import { Fish, Plus, X, Sparkles, Check, Trash2, Tag, AlertCircle } from 'lucide-react';

interface SpeciesPresetGroup {
  category: string;
  icon?: string;
  items: string[];
}

export const POPULAR_SPECIES_GROUPS: SpeciesPresetGroup[] = [
  {
    category: 'Família Tucunaré',
    items: ['Tucunaré Azul', 'Tucunaré Amarelo', 'Tucunaré-Açu', 'Tucunaré Paca', 'Tucunaré Pinima', 'Tucunaré Vazzoleri']
  },
  {
    category: 'Robalo & Água Salobra/Mar',
    items: ['Robalo Flecha', 'Robalo Peva', 'Tarpon / Camurupim', 'Pescada Amarela', 'Miraguaia', 'Garoupa']
  },
  {
    category: 'Peixes de Couro & Rio',
    items: ['Pintado', 'Pirarara', 'Jaú', 'Surubim', 'Cachara', 'Dourado', 'Trairão', 'Traíra', 'Pirarucu', 'Tambaqui', 'Pacu']
  },
  {
    category: 'Black Bass & Pesca Esportiva',
    items: ['Black Bass', 'Truta Arco-Íris', 'Tilápia', 'Matrinxã', 'Piraputanga', 'Apaiari']
  }
];

interface TournamentSpeciesEditorProps {
  speciesList: string[];
  setSpeciesList: (list: string[]) => void;
}

export const TournamentSpeciesEditor: React.FC<TournamentSpeciesEditorProps> = ({
  speciesList,
  setSpeciesList
}) => {
  const [newSpeciesInput, setNewSpeciesInput] = useState('');
  const [inputError, setInputError] = useState('');

  // Add a single custom species
  const handleAddSpecies = (nameToAdd?: string) => {
    const raw = (nameToAdd !== undefined ? nameToAdd : newSpeciesInput).trim();
    if (!raw) {
      setInputError('Digite o nome da espécie.');
      return;
    }

    // Check duplicate (case insensitive)
    const exists = speciesList.some(s => s.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setInputError(`A espécie "${raw}" já está na lista.`);
      return;
    }

    setInputError('');
    setSpeciesList([...speciesList, raw]);
    if (nameToAdd === undefined) {
      setNewSpeciesInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecies();
    }
  };

  // Remove a species
  const handleRemoveSpecies = (indexToRemove: number) => {
    setSpeciesList(speciesList.filter((_, idx) => idx !== indexToRemove));
  };

  // Add multiple species from a group
  const handleAddGroup = (items: string[]) => {
    const newItems: string[] = [];
    items.forEach(item => {
      if (!speciesList.some(s => s.toLowerCase() === item.toLowerCase()) && !newItems.includes(item)) {
        newItems.push(item);
      }
    });
    if (newItems.length > 0) {
      setSpeciesList([...speciesList, ...newItems]);
    }
  };

  // Preset quick replacements
  const handleSetPresetTucunare = () => {
    setSpeciesList(['Tucunaré Azul', 'Tucunaré Amarelo', 'Tucunaré-Açu', 'Tucunaré Paca']);
  };

  const handleSetPresetRobalo = () => {
    setSpeciesList(['Robalo Flecha', 'Robalo Peva']);
  };

  const handleSetPresetCouro = () => {
    setSpeciesList(['Pintado', 'Pirarara', 'Jaú', 'Surubim', 'Cachara']);
  };

  const handleSetPresetBass = () => {
    setSpeciesList(['Black Bass']);
  };

  const handleSetPresetAll = () => {
    setSpeciesList(['Todas as Espécies (Livre)']);
  };

  const handleClearAll = () => {
    setSpeciesList([]);
  };

  return (
    <div className="bg-[#181a1f] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Fish className="h-4 w-4" />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Espécies Válidas do Campeonato
            </h4>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold">
              {speciesList.length} {speciesList.length === 1 ? 'espécie' : 'espécies'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Defina quais espécies de peixe são aceitas e pontuam no campeonato. Os competidores selecionarão entre essas espécies ao registrar capturas.
          </p>
        </div>

        {speciesList.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer self-start sm:self-center"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Limpar Todas</span>
          </button>
        )}
      </div>

      {/* Active Species Tag List */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-sky-400" />
          <span>Espécies Atualmente Permitidas ({speciesList.length}):</span>
        </label>

        {speciesList.length === 0 ? (
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-dashed border-slate-800 text-center space-y-1">
            <p className="text-xs text-slate-400">Nenhuma espécie selecionada ainda.</p>
            <p className="text-[11px] text-slate-500">Adicione espécies abaixo ou escolha um pacote pré-definido.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 min-h-[56px] items-center">
            {speciesList.map((species, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-2 bg-gradient-to-r from-sky-950/70 to-slate-900 border border-sky-500/30 hover:border-sky-500/60 text-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm animate-fade-in"
              >
                <span className="text-sky-400">🐟</span>
                <span>{species}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpecies(idx)}
                  className="w-4 h-4 rounded-full bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer ml-0.5"
                  title={`Remover ${species}`}
                >
                  <X className="h-3 w-3 stroke-[3]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Custom Species Input */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
          + Adicionar Espécie Personalizada:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ex: Tucunaré Azul, Robalo Flecha, Dourado..."
            value={newSpeciesInput}
            onChange={(e) => {
              setNewSpeciesInput(e.target.value);
              if (inputError) setInputError('');
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#121316] border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition placeholder-slate-500"
          />
          <button
            type="button"
            onClick={() => handleAddSpecies()}
            className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Adicionar</span>
          </button>
        </div>

        {inputError && (
          <p className="text-[11px] text-rose-400 flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{inputError}</span>
          </p>
        )}
      </div>

      {/* Quick Model Presets (1-Click Packs) */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Modelos Rápidos Pré-configurados:</span>
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            onClick={handleSetPresetTucunare}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-left transition cursor-pointer group"
          >
            <span className="text-xs font-bold text-sky-400 block group-hover:underline">
              🎯 Tucunarés
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Azul, Amarelo, Açú, Paca
            </span>
          </button>

          <button
            type="button"
            onClick={handleSetPresetRobalo}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition cursor-pointer group"
          >
            <span className="text-xs font-bold text-emerald-400 block group-hover:underline">
              🌊 Robalos
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Flecha e Peva
            </span>
          </button>

          <button
            type="button"
            onClick={handleSetPresetCouro}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer group"
          >
            <span className="text-xs font-bold text-amber-400 block group-hover:underline">
              🐊 Peixes de Couro
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Pintado, Pirarara, Jaú...
            </span>
          </button>

          <button
            type="button"
            onClick={handleSetPresetBass}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition cursor-pointer group"
          >
            <span className="text-xs font-bold text-purple-400 block group-hover:underline">
              🌿 Black Bass
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Black Bass & Represa
            </span>
          </button>

          <button
            type="button"
            onClick={handleSetPresetAll}
            className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-left transition cursor-pointer group col-span-2 sm:col-span-1"
          >
            <span className="text-xs font-bold text-teal-400 block group-hover:underline">
              🌐 Qualquer Peixe
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Todas as Espécies (Livre)
            </span>
          </button>
        </div>
      </div>

      {/* Suggested Species Bank by Category */}
      <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
          Catálogo de Espécies Mais Pescadas (Clique para incluir):
        </span>
        <div className="space-y-2">
          {POPULAR_SPECIES_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {group.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleAddGroup(group.items)}
                  className="text-[11px] text-sky-400 hover:underline font-bold cursor-pointer"
                >
                  + Adicionar Grupo Completo
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {group.items.map((item, itemIdx) => {
                  const isAdded = speciesList.some(s => s.toLowerCase() === item.toLowerCase());
                  return (
                    <button
                      key={itemIdx}
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddSpecies(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs transition flex items-center gap-1 cursor-pointer ${
                        isAdded
                          ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed opacity-60'
                          : 'bg-slate-900 text-slate-300 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-500/30 border border-slate-800'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Plus className="h-3 w-3 text-slate-400" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentSpeciesEditor;
