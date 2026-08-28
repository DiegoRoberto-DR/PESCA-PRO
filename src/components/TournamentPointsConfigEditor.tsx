import React, { useState } from 'react';
import { Star, Plus, Trash2, Check, Sparkles, Award, Ruler, Fish, ToggleLeft, ToggleRight, CheckCircle2, XCircle } from 'lucide-react';
import { PointRule, SpeciesBonusRule } from '../types';
import { calculateCatchPoints } from '../utils/dbHelpers';

interface TournamentPointsConfigEditorProps {
  pointsEnabled: boolean;
  setPointsEnabled: (enabled: boolean) => void;
  pointsPerFish: number;
  setPointsPerFish: (val: number) => void;
  pointsPerCm: number;
  setPointsPerCm: (val: number) => void;
  minValidLength: number;
  setMinValidLength: (val: number) => void;
  pointRules: PointRule[];
  setPointRules: (rules: PointRule[]) => void;
  speciesBonuses: SpeciesBonusRule[];
  setSpeciesBonuses: (bonuses: SpeciesBonusRule[]) => void;
  speciesBonusEnabled?: boolean;
  setSpeciesBonusEnabled?: (enabled: boolean) => void;
}

export const TournamentPointsConfigEditor: React.FC<TournamentPointsConfigEditorProps> = ({
  pointsEnabled,
  setPointsEnabled,
  pointsPerFish,
  setPointsPerFish,
  pointsPerCm,
  setPointsPerCm,
  minValidLength,
  setMinValidLength,
  pointRules,
  setPointRules,
  speciesBonuses,
  setSpeciesBonuses,
  speciesBonusEnabled: externalSpeciesBonusEnabled,
  setSpeciesBonusEnabled: externalSetSpeciesBonusEnabled
}) => {
  // Local state for toggles if not controlled externally
  const [internalSpeciesBonusEnabled, setInternalSpeciesBonusEnabled] = useState<boolean>(speciesBonuses.length > 0);
  const speciesBonusActive = externalSpeciesBonusEnabled !== undefined ? externalSpeciesBonusEnabled : internalSpeciesBonusEnabled;
  const setSpeciesBonusActive = (val: boolean) => {
    if (externalSetSpeciesBonusEnabled) {
      externalSetSpeciesBonusEnabled(val);
    } else {
      setInternalSpeciesBonusEnabled(val);
    }
  };

  // State for points per cm toggle
  const [isPerCmActive, setIsPerCmActive] = useState<boolean>(pointsPerCm > 0);

  // New rule inputs
  const [newRuleMin, setNewRuleMin] = useState<string>('');
  const [newRuleMax, setNewRuleMax] = useState<string>('');
  const [newRulePoints, setNewRulePoints] = useState<string>('');
  const [newRuleDesc, setNewRuleDesc] = useState<string>('');

  // New species bonus inputs
  const [newSpeciesName, setNewSpeciesName] = useState<string>('');
  const [newSpeciesBonus, setNewSpeciesBonus] = useState<string>('');
  const [newSpeciesDesc, setNewSpeciesDesc] = useState<string>('');

  // Live Test Calculator state
  const [testLength, setTestLength] = useState<number>(38);
  const [testSpecies, setTestSpecies] = useState<string>('Tucunaré');

  // Toggle Points Per CM Handler
  const handleTogglePointsPerCm = (enable: boolean) => {
    setIsPerCmActive(enable);
    if (enable) {
      if (pointsPerCm <= 0) {
        setPointsPerCm(1);
      }
    } else {
      setPointsPerCm(0);
    }
  };

  // Toggle Species Bonus Handler
  const handleToggleSpeciesBonus = (enable: boolean) => {
    setSpeciesBonusActive(enable);
    if (!enable && speciesBonuses.length === 0) {
      // already empty
    }
  };

  // Presets handlers
  const applyPresetTucunareStandard = () => {
    setPointsEnabled(true);
    setMinValidLength(25);
    setPointsPerFish(1);
    setPointsPerCm(0);
    setIsPerCmActive(false);
    setPointRules([
      { id: 'r1', minCm: 25, maxCm: 34.9, points: 10, description: '25cm a 34.9cm' },
      { id: 'r2', minCm: 35, maxCm: 44.9, points: 20, description: '35cm a 44.9cm' },
      { id: 'r3', minCm: 45, maxCm: 54.9, points: 40, description: '45cm a 54.9cm' },
      { id: 'r4', minCm: 55, points: 80, description: '55cm ou mais (Troféu)' }
    ]);
    setSpeciesBonuses([]);
    setSpeciesBonusActive(false);
  };

  const applyPresetOnePointPerFish = () => {
    setPointsEnabled(true);
    setMinValidLength(20);
    setPointsPerFish(1);
    setPointsPerCm(0);
    setIsPerCmActive(false);
    setPointRules([]);
    setSpeciesBonuses([]);
    setSpeciesBonusActive(false);
  };

  const applyPresetPerCentimeter = () => {
    setPointsEnabled(true);
    setMinValidLength(20);
    setPointsPerFish(0);
    setPointsPerCm(1);
    setIsPerCmActive(true);
    setPointRules([]);
    setSpeciesBonuses([]);
    setSpeciesBonusActive(false);
  };

  const applyPresetProgressive = () => {
    setPointsEnabled(true);
    setMinValidLength(20);
    setPointsPerFish(1);
    setPointsPerCm(0);
    setIsPerCmActive(false);
    setPointRules([
      { id: 'r1', minCm: 20, maxCm: 29.9, points: 5, description: '20cm a 29.9cm' },
      { id: 'r2', minCm: 30, maxCm: 39.9, points: 15, description: '30cm a 39.9cm' },
      { id: 'r3', minCm: 40, maxCm: 49.9, points: 30, description: '40cm a 49.9cm' },
      { id: 'r4', minCm: 50, maxCm: 59.9, points: 60, description: '50cm a 59.9cm' },
      { id: 'r5', minCm: 60, points: 100, description: '60cm ou mais (Super Troféu)' }
    ]);
    setSpeciesBonuses([]);
    setSpeciesBonusActive(false);
  };

  // Add rule handler
  const handleAddRule = () => {
    const minVal = parseFloat(newRuleMin);
    const pts = parseFloat(newRulePoints);

    if (isNaN(minVal) || isNaN(pts)) {
      alert('Por favor, informe pelo menos o Comprimento Mínimo (cm) e a Quantidade de Pontos.');
      return;
    }

    const maxVal = newRuleMax.trim() ? parseFloat(newRuleMax) : undefined;
    const desc = newRuleDesc.trim() || (maxVal ? `${minVal}cm a ${maxVal}cm` : `${minVal}cm ou mais`);

    const newRule: PointRule = {
      id: 'rule_' + Date.now(),
      minCm: minVal,
      maxCm: maxVal,
      points: pts,
      description: desc
    };

    // Sort rules by minCm
    const updated = [...pointRules, newRule].sort((a, b) => a.minCm - b.minCm);
    setPointRules(updated);

    // Reset inputs
    setNewRuleMin('');
    setNewRuleMax('');
    setNewRulePoints('');
    setNewRuleDesc('');
  };

  const handleRemoveRule = (id: string) => {
    setPointRules(pointRules.filter(r => r.id !== id));
  };

  // Add species bonus handler
  const handleAddSpeciesBonus = () => {
    if (!newSpeciesName.trim()) {
      alert('Informe o nome da espécie para o bônus.');
      return;
    }
    const bonusVal = parseFloat(newSpeciesBonus);
    if (isNaN(bonusVal) || bonusVal <= 0) {
      alert('Informe a quantidade de pontos bônus.');
      return;
    }

    const newBonus: SpeciesBonusRule = {
      species: newSpeciesName.trim(),
      bonusPoints: bonusVal,
      description: newSpeciesDesc.trim() || `Bônus por captura de ${newSpeciesName.trim()}`
    };

    setSpeciesBonuses([...speciesBonuses, newBonus]);
    setSpeciesBonusActive(true);
    setNewSpeciesName('');
    setNewSpeciesBonus('');
    setNewSpeciesDesc('');
  };

  const handleRemoveSpeciesBonus = (index: number) => {
    setSpeciesBonuses(speciesBonuses.filter((_, idx) => idx !== index));
  };

  // Calculate live test preview
  const livePreview = calculateCatchPoints(testLength, testSpecies, {
    enabled: pointsEnabled,
    scoringMode: 'ranges',
    pointsPerFish: Number(pointsPerFish) || 0,
    pointsPerCm: isPerCmActive ? (Number(pointsPerCm) || 0) : 0,
    pointsPerCmEnabled: isPerCmActive,
    minValidLength: Number(minValidLength) || 0,
    pointRules: pointRules,
    speciesBonusEnabled: speciesBonusActive,
    speciesBonus: speciesBonusActive ? speciesBonuses : []
  });

  return (
    <div className="bg-[#181a1f] border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-xl">
      {/* Header & Main Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
            <h4 className="text-base font-extrabold text-white">
              Sistema de Pontuação dos Peixes
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase">
              Ranking por Pontos
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-xl">
            Configure regras personalizadas: pontuação por faixas de tamanho, pontos extras por centímetro e bônus especial por espécie.
          </p>
        </div>

        {/* Enable / Disable Main Switch */}
        <button
          type="button"
          onClick={() => setPointsEnabled(!pointsEnabled)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer shrink-0 shadow-lg ${
            pointsEnabled
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded-full transition ${pointsEnabled ? 'bg-slate-950' : 'bg-slate-500'}`} />
          <span>{pointsEnabled ? '✓ SISTEMA DE PONTOS ATIVADO' : 'ATIVAR SISTEMA DE PONTOS'}</span>
        </button>
      </div>

      {pointsEnabled && (
        <div className="space-y-6 animate-fade-in">
          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Modelos Pré-definidos Prontos (Clique para Carregar):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={applyPresetTucunareStandard}
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-amber-400 block group-hover:underline">
                  🎯 Padrão Tucunaré
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  10/20/40/80 pts por faixas (25cm+)
                </span>
              </button>

              <button
                type="button"
                onClick={applyPresetProgressive}
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-emerald-400 block group-hover:underline">
                  🏆 Faixas Progressivas
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  5/15/30/60/100 pts (20cm a 60cm+)
                </span>
              </button>

              <button
                type="button"
                onClick={applyPresetOnePointPerFish}
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-left transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-sky-400 block group-hover:underline">
                  🐟 1 Ponto por Peixe
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Cada peixe válido homologado = 1 ponto
                </span>
              </button>

              <button
                type="button"
                onClick={applyPresetPerCentimeter}
                className="p-3 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition cursor-pointer group"
              >
                <span className="text-xs font-bold text-purple-400 block group-hover:underline">
                  📏 1 Ponto por Centímetro
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Peixe de 45cm = 45 pontos no total
                </span>
              </button>
            </div>
          </div>

          {/* Base Parameters Grid: Minimum Length & Points per Fish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 block flex items-center gap-1.5">
                <Ruler className="h-3.5 w-3.5 text-amber-400" />
                <span>TAMANHO MÍNIMO VÁLIDO (CM) *</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={minValidLength}
                onChange={(e) => setMinValidLength(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121316] border border-slate-800 text-amber-400 font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Peixes abaixo desta medida não pontuam.
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1.5 block flex items-center gap-1.5">
                <Fish className="h-3.5 w-3.5 text-sky-400" />
                <span>PONTOS BASE FIXOS POR PEIXE HOMOLOGADO</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={pointsPerFish}
                onChange={(e) => setPointsPerFish(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#121316] border border-slate-800 text-white font-mono font-bold rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-amber-500 transition"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Pontuação base concedida por qualquer exemplar válido.
              </span>
            </div>
          </div>

          {/* SECTION: PONTOS EXTRAS POR CENTÍMETRO (ATIVAR / DESATIVAR) */}
          <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-200">
                    Pontos Extras por Centímetro Medido
                  </span>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                    isPerCmActive && pointsPerCm > 0
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isPerCmActive && pointsPerCm > 0 ? `🟢 ATIVADO (${pointsPerCm} pt/cm)` : '🔒 DESATIVADO'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multiplica cada centímetro do peixe pelo valor configurado (ex: peixe de 40cm com 1 pt/cm = +40 pontos).
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePointsPerCm(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isPerCmActive && pointsPerCm > 0
                      ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-950/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ativar Pontos por CM</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePointsPerCm(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    !isPerCmActive || pointsPerCm <= 0
                      ? 'bg-slate-800 text-slate-300 font-bold border border-slate-700'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-rose-400'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Desativar</span>
                </button>
              </div>
            </div>

            {/* If Enabled, show multiplier controls & quick buttons */}
            {isPerCmActive && (
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-purple-500/30 space-y-3 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="text-[10px] font-mono font-bold uppercase text-slate-300 block mb-1">
                      Multiplicador (Pontos por Cada 1 Centímetro):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={pointsPerCm || 1}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setPointsPerCm(val);
                          setIsPerCmActive(val > 0);
                        }}
                        className="w-32 bg-[#121316] border border-purple-500/40 text-purple-300 font-mono font-bold rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-purple-400"
                      />
                      <span className="text-xs text-slate-400 font-mono">
                        pts / cm
                      </span>
                    </div>
                  </div>

                  {/* Quick Pill Multipliers */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">
                      Valores Rápidos:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[0.5, 1, 1.5, 2, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setPointsPerCm(val);
                            setIsPerCmActive(true);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                            pointsPerCm === val
                              ? 'bg-purple-500 text-slate-950 font-black shadow'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          +{val} pt/cm
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Size Range Point Rules Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Faixas de Pontuação por Centímetro ({pointRules.length})</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                Ex: de 25 a 34.9cm = 10 pts, de 35 a 44.9cm = 20 pts...
              </span>
            </div>

            {/* List of current configured rules */}
            {pointRules.length === 0 ? (
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-center text-slate-500 text-xs">
                Nenhuma faixa de tamanho cadastrada. Adicione faixas abaixo ou selecione um modelo pronto acima.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {pointRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-extrabold flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs">+{rule.points}</span>
                        <span className="text-[8px] uppercase">pts</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {rule.minCm} cm {rule.maxCm ? `até ${rule.maxCm} cm` : 'ou maior (Troféu)'}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {rule.description || 'Faixa de pontuação'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveRule(rule.id)}
                      className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer shrink-0"
                      title="Excluir Faixa"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Range Form */}
            <div className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                + Adicionar Nova Faixa de Pontuação:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="De (cm) *"
                    value={newRuleMin}
                    onChange={(e) => setNewRuleMin(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Até (cm) (vazio = troféu)"
                    value={newRuleMax}
                    onChange={(e) => setNewRuleMax(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="1"
                    placeholder="Pontos (pts) *"
                    value={newRulePoints}
                    onChange={(e) => setNewRulePoints(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-800 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Descrição / Rótulo (opcional)"
                    value={newRuleDesc}
                    onChange={(e) => setNewRuleDesc(e.target.value)}
                    className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddRule}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Salvar e Adicionar Faixa</span>
              </button>
            </div>
          </div>

          {/* SECTION: BÔNUS ESPECIAL POR ESPÉCIE DE PEIXE (ATIVAR / DESATIVAR) */}
          <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold uppercase text-slate-200">
                    Bônus Especial por Espécie de Peixe ({speciesBonusActive ? speciesBonuses.length : 0})
                  </span>
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                    speciesBonusActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {speciesBonusActive ? '🟢 ATIVADO' : '🔒 DESATIVADO'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Concede pontuação extra automática quando o competidor captura espécies específicas (ex: Tucunaré Açú = +15 pts).
                </p>
              </div>

              {/* Species Bonus Toggle Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSpeciesBonus(true)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    speciesBonusActive
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-950/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Ativar Bônus por Espécie</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleSpeciesBonus(false)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    !speciesBonusActive
                      ? 'bg-slate-800 text-slate-300 font-bold border border-slate-700'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-rose-400'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Desativar</span>
                </button>
              </div>
            </div>

            {speciesBonusActive ? (
              <div className="space-y-3 animate-fade-in">
                {/* List of current configured species bonuses */}
                {speciesBonuses.length === 0 ? (
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-center text-slate-400 text-xs">
                    Nenhum bônus por espécie cadastrado ainda. Use o formulário abaixo para adicionar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {speciesBonuses.map((sb, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-extrabold flex flex-col items-center justify-center shrink-0">
                            <span className="text-xs">+{sb.bonusPoints}</span>
                            <span className="text-[8px] uppercase">pts</span>
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              🐟 {sb.species}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {sb.description || 'Bônus por espécie'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSpeciesBonus(idx)}
                          className="p-2 bg-slate-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-xl transition cursor-pointer shrink-0"
                          title="Excluir Bônus"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Species Bonus Form */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    + Adicionar Bônus para Espécie Específica:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <input
                        type="text"
                        placeholder="Nome da Espécie (ex: Tucunaré Açú) *"
                        value={newSpeciesName}
                        onChange={(e) => setNewSpeciesName(e.target.value)}
                        className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        step="1"
                        placeholder="Pontos Bônus (+pts) *"
                        value={newSpeciesBonus}
                        onChange={(e) => setNewSpeciesBonus(e.target.value)}
                        className="w-full bg-[#121316] border border-slate-800 text-emerald-400 font-mono font-bold rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Observação (ex: Espécie nobre) (opcional)"
                        value={newSpeciesDesc}
                        onChange={(e) => setNewSpeciesDesc(e.target.value)}
                        className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpeciesBonus}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Salvar Bônus de Espécie</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-500 text-xs flex items-center justify-between">
                <span>Os bônus especiais por espécie estão desativados para este campeonato.</span>
                <button
                  type="button"
                  onClick={() => handleToggleSpeciesBonus(true)}
                  className="text-emerald-400 hover:underline font-bold text-xs cursor-pointer ml-2"
                >
                  Ativar Bônus
                </button>
              </div>
            )}
          </div>

          {/* Section: Live Simulator */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-amber-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Simulador de Regras em Tempo Real (Teste Imediato)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Veja quantos pontos um peixe receberá com as regras ativas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Tamanho de Teste (cm):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="15"
                    max="80"
                    step="0.5"
                    value={testLength}
                    onChange={(e) => setTestLength(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-sm font-mono font-bold text-white px-2 py-1 bg-slate-900 rounded-lg border border-slate-800 shrink-0">
                    {testLength} cm
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Espécie de Teste:
                </label>
                <input
                  type="text"
                  value={testSpecies}
                  onChange={(e) => setTestSpecies(e.target.value)}
                  placeholder="Nome da espécie para teste..."
                  className="w-full bg-[#121316] border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Simulator Output Result */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Cálculo Aplicado:
                </span>
                <span className="text-xs text-slate-200 font-mono">
                  {livePreview.breakdown}
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Pontos Concedidos
                </span>
                <span className="text-xl font-mono font-black text-amber-400">
                  +{livePreview.points} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentPointsConfigEditor;
