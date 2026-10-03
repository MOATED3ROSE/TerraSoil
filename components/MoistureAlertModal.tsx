import React, { useState, useEffect } from 'react';
import { 
  Field, 
  Farm, 
  MoistureAlert, 
  CropMoistureThresholdConfig, 
  CustomAlertRule, 
  AlertConditionItem, 
  AlertMetricTarget, 
  ComparisonOperator, 
  PersistenceDuration,
  MoistureAlertSeverity,
  CompoundAlertEvaluationResult 
} from '../types';
import { DEFAULT_CROP_MOISTURE_THRESHOLDS } from '../utils/moistureAlertUtils';
import { 
  SYSTEM_CUSTOM_ALERT_PRESETS, 
  evaluateAllCustomRulesForFields, 
  getPersistenceLabel, 
  evaluateFieldAgainstRule 
} from '../utils/customAlertEngine';
import { 
  AlertTriangle, 
  X, 
  Droplets, 
  Sliders, 
  CheckCircle2, 
  ShieldAlert, 
  Bell, 
  Check, 
  ArrowRight,
  Sprout,
  HelpCircle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Layers,
  Activity,
  CloudRain,
  Sun,
  Shield,
  Filter,
  CheckCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MoistureAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: MoistureAlert[];
  currentField: Field;
  currentFarm: Farm;
  thresholdConfig: CropMoistureThresholdConfig;
  onUpdateThresholdConfig: (newConfig: CropMoistureThresholdConfig) => void;
  onAcknowledgeAlert: (alertId: string) => void;
  onSimulateMoistureDrop: (fieldId: string, simulatedMoisture: number) => void;
}

export const MoistureAlertModal: React.FC<MoistureAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentField,
  currentFarm,
  thresholdConfig,
  onUpdateThresholdConfig,
  onAcknowledgeAlert,
  onSimulateMoistureDrop,
}) => {
  const [activeTab, setActiveTab] = useState<'active-alerts' | 'custom-rules' | 'threshold-config'>('custom-rules');
  
  // Crop threshold state
  const [localConfig, setLocalConfig] = useState<CropMoistureThresholdConfig>({
    ...DEFAULT_CROP_MOISTURE_THRESHOLDS,
    ...thresholdConfig,
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Custom Alert Rules state (persisted in localStorage)
  const [customRules, setCustomRules] = useState<CustomAlertRule[]>(() => {
    try {
      const saved = localStorage.getItem('terrasoil_custom_alert_rules');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load custom rules from storage', e);
    }
    return SYSTEM_CUSTOM_ALERT_PRESETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('terrasoil_custom_alert_rules', JSON.stringify(customRules));
    } catch (e) {
      console.error('Failed to save custom rules to storage', e);
    }
  }, [customRules]);

  // Rule Builder Form State
  const [showRuleBuilder, setShowRuleBuilder] = useState<boolean>(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState<string>('');
  const [ruleDescription, setRuleDescription] = useState<string>('');
  const [ruleSeverity, setRuleSeverity] = useState<MoistureAlertSeverity>('critical');
  const [logicalOperator, setLogicalOperator] = useState<'AND' | 'OR'>('AND');
  const [persistenceDuration, setPersistenceDuration] = useState<PersistenceDuration>('2_cycles');
  const [cropFilter, setCropFilter] = useState<string>('ALL');
  const [ruleConditions, setRuleConditions] = useState<AlertConditionItem[]>([
    { id: 'c1', metric: 'root_zone_moisture', operator: 'less_than', thresholdValue: 22, unit: '% VWC' },
    { id: 'c2', metric: 'precipitation_7day', operator: 'less_than', thresholdValue: 12, unit: 'mm' },
    { id: 'c3', metric: 'ndvi_trend', operator: 'declining', thresholdValue: 0, unit: 'trend' },
  ]);
  const [mitigationStepsInput, setMitigationStepsInput] = useState<string>(
    'Prioritize supplemental irrigation.\nMaintain surface residue mulch.\nDelay foliar chemical passes.'
  );

  // Live Compound Rule Trigger Evaluations across Farm Fields
  const evaluatedCompoundAlerts: CompoundAlertEvaluationResult[] = evaluateAllCustomRulesForFields(
    currentFarm.fields,
    customRules
  );

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    onUpdateThresholdConfig(localConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleToggleRule = (ruleId: string) => {
    setCustomRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (ruleId: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== ruleId));
  };

  const handleResetPresets = () => {
    setCustomRules(SYSTEM_CUSTOM_ALERT_PRESETS);
  };

  const handleOpenNewRuleBuilder = () => {
    setEditingRuleId(null);
    setRuleName('Custom Agro-Climatic Alert');
    setRuleDescription('Compound trigger evaluating root-zone moisture, 7-day rainfall, and satellite vegetation vigor.');
    setRuleSeverity('warning');
    setLogicalOperator('AND');
    setPersistenceDuration('2_cycles');
    setCropFilter('ALL');
    setRuleConditions([
      { id: `c-${Date.now()}-1`, metric: 'root_zone_moisture', operator: 'less_than', thresholdValue: 20, unit: '% VWC' },
      { id: `c-${Date.now()}-2`, metric: 'precipitation_7day', operator: 'less_than', thresholdValue: 10, unit: 'mm' },
    ]);
    setMitigationStepsInput('Assess subsoil hydration profile.\nDeploy ground-truth probe verification.');
    setShowRuleBuilder(true);
  };

  const handleAddCondition = () => {
    const newCond: AlertConditionItem = {
      id: `c-${Date.now()}-${ruleConditions.length + 1}`,
      metric: 'surface_moisture',
      operator: 'less_than',
      thresholdValue: 18,
      unit: '% VWC',
    };
    setRuleConditions([...ruleConditions, newCond]);
  };

  const handleUpdateCondition = (index: number, updates: Partial<AlertConditionItem>) => {
    setRuleConditions((prev) => {
      const next = [...prev];
      const target = { ...next[index], ...updates };
      
      // Auto-set appropriate default units
      if (updates.metric) {
        if (updates.metric === 'root_zone_moisture' || updates.metric === 'surface_moisture') {
          target.unit = '% VWC';
          target.thresholdValue = 20;
        } else if (updates.metric === 'precipitation_7day' || updates.metric === 'precipitation_14day') {
          target.unit = 'mm';
          target.thresholdValue = 15;
        } else if (updates.metric === 'ndvi_current') {
          target.unit = 'NDVI';
          target.thresholdValue = 0.55;
        } else if (updates.metric === 'temperature_max') {
          target.unit = '°F';
          target.thresholdValue = 88;
        } else if (updates.metric === 'ndvi_trend') {
          target.unit = 'trend';
          target.operator = 'declining';
        }
      }
      next[index] = target;
      return next;
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (ruleConditions.length <= 1) return;
    setRuleConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveCustomRule = () => {
    const steps = mitigationStepsInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newRule: CustomAlertRule = {
      id: editingRuleId || `custom-rule-${Date.now()}`,
      name: ruleName.trim() || 'Custom Agronomic Alert',
      description: ruleDescription.trim() || 'Custom compound telemetry alert rule',
      enabled: true,
      severity: ruleSeverity,
      logicalOperator,
      conditions: ruleConditions,
      persistenceDuration,
      cropFilter,
      mitigationWorkflow: steps.length > 0 ? steps : ['Monitor soil hydration and satellite NDVI closely.'],
      createdAt: new Date().toISOString(),
      isSystemPreset: false,
    };

    if (editingRuleId) {
      setCustomRules((prev) => prev.map((r) => (r.id === editingRuleId ? newRule : r)));
    } else {
      setCustomRules((prev) => [newRule, ...prev]);
    }

    setShowRuleBuilder(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 text-stone-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-rose-950/80 text-rose-400 rounded-2xl border border-rose-800 shadow-inner">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  Agro-Climatic Moisture &amp; Telemetry Alert Center
                </h3>
                {evaluatedCompoundAlerts.length > 0 && (
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded-full text-xs font-bold font-mono">
                    {evaluatedCompoundAlerts.length} Compound Alerts
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Automated multi-condition rule engine combining NDVI trends, precipitation forecasts, and root-zone moisture thresholds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-2 rounded-xl hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-900/90 px-4 sm:px-6 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => {
                setActiveTab('custom-rules');
                setShowRuleBuilder(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                activeTab === 'custom-rules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Custom Alert Rules ({customRules.filter((r) => r.enabled).length} Active)</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('active-alerts');
                setShowRuleBuilder(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                activeTab === 'active-alerts'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Live Triggers ({evaluatedCompoundAlerts.length + alerts.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('threshold-config');
                setShowRuleBuilder(false);
              }}
              className={`px-3 py-1.5 rounded-lg transition font-semibold flex items-center gap-1.5 ${
                activeTab === 'threshold-config'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Crop Thresholds</span>
            </button>
          </div>

          {/* Drydown Simulation Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSimulateMoistureDrop(currentField.id, 17)}
              className="bg-stone-950 hover:bg-stone-800 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-900/50 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Simulate a dry spell (17% VWC) on current field to test compound rule evaluation"
            >
              <Droplets className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Drought (17% VWC)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* TAB 1: CUSTOM RULE ENGINE BUILDER & PERSISTENCE */}
          {activeTab === 'custom-rules' && (
            <div className="space-y-5">
              
              {/* Top Banner & Add New Rule Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-950 p-4 rounded-2xl border border-stone-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-stone-100 text-sm">
                      Persistence-Based Multi-Condition Alert Rules
                    </h4>
                  </div>
                  <p className="text-stone-400 text-xs max-w-xl">
                    Define custom triggers combining satellite NDVI trend slopes, 7/14-day rainfall totals, surface evaporation, and root-zone water content across specific persistence timeframes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetPresets}
                    className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-semibold transition"
                    title="Reload default agronomic rule templates"
                  >
                    Reset Presets
                  </button>

                  <button
                    onClick={handleOpenNewRuleBuilder}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-950"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Rule</span>
                  </button>
                </div>
              </div>

              {/* Interactive Rule Builder Drawer / Form */}
              {showRuleBuilder && (
                <div className="bg-stone-950 p-5 rounded-2xl border-2 border-emerald-500/80 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top duration-200">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      <h4 className="font-bold text-stone-100 text-sm">
                        {editingRuleId ? 'Edit Custom Alert Rule' : 'New Agro-Climatic Rule Configuration'}
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowRuleBuilder(false)}
                      className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Rule Name & Severity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 block">
                        Rule Name
                      </label>
                      <input
                        type="text"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="e.g. Compound Drought & Canopy Deficit Alert"
                        className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 block">
                        Alert Severity
                      </label>
                      <select
                        value={ruleSeverity}
                        onChange={(e) => setRuleSeverity(e.target.value as MoistureAlertSeverity)}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="critical">🔴 Critical Alert (Red)</option>
                        <option value="warning">🟡 Agronomic Warning (Yellow)</option>
                        <option value="optimal">🔵 Advisory / Informational (Blue)</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Description &amp; Agronomic Logic
                    </label>
                    <input
                      type="text"
                      value={ruleDescription}
                      onChange={(e) => setRuleDescription(e.target.value)}
                      placeholder="e.g. Triggers when root moisture drops below threshold combined with low rain and declining NDVI vigor."
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Multi-Condition Logical Builder */}
                  <div className="space-y-3 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-200">Conditions Conjunction:</span>
                        <div className="flex items-center bg-stone-950 rounded-lg p-0.5 border border-stone-800">
                          <button
                            type="button"
                            onClick={() => setLogicalOperator('AND')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                              logicalOperator === 'AND' ? 'bg-emerald-600 text-white' : 'text-stone-400'
                            }`}
                          >
                            AND (All Must Match)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLogicalOperator('OR')}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                              logicalOperator === 'OR' ? 'bg-emerald-600 text-white' : 'text-stone-400'
                            }`}
                          >
                            OR (Any May Match)
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddCondition}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-stone-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Condition</span>
                      </button>
                    </div>

                    {/* Condition Rows */}
                    <div className="space-y-2.5">
                      {ruleConditions.map((cond, idx) => (
                        <div
                          key={cond.id}
                          className="flex flex-wrap items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs"
                        >
                          <span className="w-5 h-5 rounded-full bg-stone-800 text-stone-300 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>

                          {/* Metric Selector */}
                          <select
                            value={cond.metric}
                            onChange={(e) => handleUpdateCondition(idx, { metric: e.target.value as AlertMetricTarget })}
                            className="bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option value="root_zone_moisture">Root-Zone Moisture (10-40cm)</option>
                            <option value="surface_moisture">Surface Moisture (0-10cm)</option>
                            <option value="ndvi_trend">Sentinel-2 NDVI Trend</option>
                            <option value="ndvi_current">Sentinel-2 Current NDVI</option>
                            <option value="precipitation_7day">7-Day Cumulative Rain</option>
                            <option value="precipitation_14day">14-Day Cumulative Rain</option>
                            <option value="temperature_max">Max Air Temperature</option>
                          </select>

                          {/* Operator */}
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(idx, { operator: e.target.value as ComparisonOperator })}
                            className="bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {cond.metric === 'ndvi_trend' ? (
                              <>
                                <option value="declining">is Declining / Stressed</option>
                                <option value="stagnant">is Stagnant / Below Normal</option>
                              </>
                            ) : (
                              <>
                                <option value="less_than">&lt; Less Than</option>
                                <option value="greater_than">&gt; Greater Than</option>
                              </>
                            )}
                          </select>

                          {/* Threshold Value (if not ndvi_trend) */}
                          {cond.metric !== 'ndvi_trend' && (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                step={cond.metric === 'ndvi_current' ? '0.05' : '1'}
                                value={cond.thresholdValue}
                                onChange={(e) => handleUpdateCondition(idx, { thresholdValue: Number(e.target.value) })}
                                className="w-20 bg-stone-900 border border-stone-700 text-emerald-400 font-mono font-bold rounded-lg px-2 py-1.5 text-xs text-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              />
                              <span className="text-stone-400 font-mono text-xs">{cond.unit}</span>
                            </div>
                          )}

                          {ruleConditions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCondition(idx)}
                              className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg ml-auto transition"
                              title="Remove condition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Persistence & Crop Filter Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Persistence Duration Requirement</span>
                      </label>
                      <select
                        value={persistenceDuration}
                        onChange={(e) => setPersistenceDuration(e.target.value as PersistenceDuration)}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="immediate">Immediate Trigger (Single Telemetry Scan)</option>
                        <option value="2_cycles">Persisting for 2+ Consecutive Scans (~14 Days)</option>
                        <option value="3_cycles">Persisting for 3+ Consecutive Scans (~21 Days)</option>
                        <option value="4_weeks">Chronic Persistence (&gt; 28 Days)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-stone-400 flex items-center gap-1">
                        <Filter className="w-3.5 h-3.5 text-amber-400" />
                        <span>Target Crop Filter</span>
                      </label>
                      <select
                        value={cropFilter}
                        onChange={(e) => setCropFilter(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      >
                        <option value="ALL">All Crops Across Farm</option>
                        <option value="corn">Corn / Maize Only</option>
                        <option value="soy">Soybeans Only</option>
                        <option value="wheat">Wheat &amp; Small Grains Only</option>
                        <option value="cover">Cover Crop Mixes Only</option>
                        <option value="pasture">Pasture &amp; Forage Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Mitigation Steps Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Recommended Mitigation Guidance (One Action Per Line)
                    </label>
                    <textarea
                      rows={3}
                      value={mitigationStepsInput}
                      onChange={(e) => setMitigationStepsInput(e.target.value)}
                      placeholder="Enter actionable steps..."
                      className="w-full bg-stone-900 border border-stone-700 text-stone-200 rounded-xl p-3 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Save Rule Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setShowRuleBuilder(false)}
                      className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 hover:bg-stone-900 text-xs font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCustomRule}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                    >
                      Save Rule
                    </button>
                  </div>
                </div>
              )}

              {/* Active Rules List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">
                    Configured Rule Library ({customRules.length})
                  </span>
                  <span>{customRules.filter((r) => r.enabled).length} Enabled for live background evaluation</span>
                </div>

                <div className="space-y-3">
                  {customRules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        rule.enabled
                          ? 'bg-stone-950 border-stone-800'
                          : 'bg-stone-950/40 border-stone-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider border ${
                              rule.severity === 'critical'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}>
                              {rule.severity.toUpperCase()}
                            </span>

                            <h4 className="text-sm font-bold text-stone-100">
                              {rule.name}
                            </h4>

                            {rule.isSystemPreset && (
                              <span className="bg-stone-900 text-stone-400 border border-stone-800 px-2 py-0.5 rounded-md text-[10px] font-mono">
                                Agronomic Preset
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-400 leading-relaxed">
                            {rule.description}
                          </p>
                        </div>

                        {/* Toggle & Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition border ${
                              rule.enabled
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-stone-900 text-stone-500 border-stone-800'
                            }`}
                          >
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                            title="Delete rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Compound Condition Badges */}
                      <div className="mt-3 pt-3 border-t border-stone-900 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          Conditions ({rule.logicalOperator}):
                        </span>
                        {rule.conditions.map((cond, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 font-mono text-[11px]"
                          >
                            {cond.metric.replace(/_/g, ' ')} {cond.operator === 'less_than' ? '<' : cond.operator === 'greater_than' ? '>' : ''} {cond.metric !== 'ndvi_trend' ? `${cond.thresholdValue} ${cond.unit}` : cond.operator}
                          </span>
                        ))}

                        <span className="ml-auto text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-900/60 px-2 py-0.5 rounded-md">
                          {getPersistenceLabel(rule.persistenceDuration)}
                        </span>
                      </div>

                      {/* Mitigation Actions */}
                      <div className="mt-3 pt-2.5 border-t border-stone-900/80 space-y-1">
                        <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                          Automated Action Workflow:
                        </span>
                        <ul className="space-y-0.5 text-stone-400 text-[11px]">
                          {rule.mitigationWorkflow.slice(0, 2).map((step, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold">&bull;</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE ACTIVE COMPOUND ALERTS */}
          {activeTab === 'active-alerts' && (
            <div className="space-y-4">
              {evaluatedCompoundAlerts.length === 0 && alerts.length === 0 ? (
                <div className="p-12 text-center text-stone-400 space-y-3 bg-stone-950/60 rounded-2xl border border-stone-800">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-stone-200">
                    All Fields Within Safe Agronomic Thresholds
                  </h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    No active compound alerts triggered for {currentFarm.name}. Soil moisture and NDVI vigor are healthy.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => onSimulateMoistureDrop(currentField.id, 17)}
                      className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Simulate drydown (17% VWC) to test live compound alerts</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Evaluated Custom Compound Alerts */}
                  {evaluatedCompoundAlerts.map((compound, idx) => (
                    <div
                      key={`comp-${idx}`}
                      className={`p-4 rounded-2xl border transition-all ${
                        compound.severity === 'critical'
                          ? 'bg-rose-950/40 border-rose-700/80 shadow-lg'
                          : 'bg-amber-950/40 border-amber-700/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                              compound.severity === 'critical'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              COMPOUND {compound.severity.toUpperCase()}
                            </span>
                            <span className="text-stone-400 text-[11px] font-mono">
                              {new Date(compound.triggeredAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-100">
                            {compound.ruleName} &bull; {compound.fieldName}
                          </h4>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-stone-900 border border-stone-800 text-[11px] font-mono text-cyan-300 font-bold">
                          {compound.persistenceSummary}
                        </span>
                      </div>

                      {/* Satisfied Conditions */}
                      <div className="mt-3 pt-2.5 border-t border-stone-800/80 space-y-1.5">
                        <span className="text-[10px] font-bold text-stone-300 uppercase tracking-wider block">
                          Triggered Compound Criteria:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {compound.triggeredConditions.map((condStr, cIdx) => (
                            <span
                              key={cIdx}
                              className="px-2.5 py-1 rounded-lg bg-stone-950 border border-rose-900/60 text-rose-300 text-xs font-mono"
                            >
                              &bull; {condStr}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Mitigation Actions */}
                      <div className="mt-3 pt-2.5 border-t border-stone-800/80 space-y-1.5">
                        <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                          Recommended Agronomic Mitigation Actions:
                        </span>
                        <ul className="space-y-1 text-stone-300 text-[11px]">
                          {compound.mitigationSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  {/* Standard Threshold Alerts */}
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-2xl border bg-stone-950 border-stone-800 transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider bg-rose-950 text-rose-300 border border-rose-800">
                              Root-Zone Moisture Deficit
                            </span>
                            <span className="text-stone-400 text-[11px] font-mono">
                              {new Date(alert.triggeredAt).toLocaleTimeString()}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-stone-100">
                            {alert.fieldName} &bull; {alert.cropType}
                          </h4>
                        </div>

                        <button
                          onClick={() => onAcknowledgeAlert(alert.id)}
                          className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-1.5 rounded-xl text-[11px] font-semibold flex items-center gap-1 transition shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          Dismiss
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-stone-800/80 bg-stone-900/60 p-2.5 rounded-xl">
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Current Root Moisture</span>
                          <span className="text-base font-bold text-rose-400 font-mono">
                            {alert.currentRootZoneMoisturePct}% VWC
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Critical Crop Threshold</span>
                          <span className="text-base font-bold text-stone-200 font-mono">
                            {alert.criticalThresholdPct}% VWC
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block font-medium">Deficit Magnitude</span>
                          <span className="text-base font-bold text-amber-400 font-mono">
                            -{alert.deficitPct}% VWC
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CROP THRESHOLD CONFIGURATION */}
          {activeTab === 'threshold-config' && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Set custom root-zone volumetric water content (VWC %) alert thresholds per crop. If telemetry drops below these limits during active growing windows, TerraSoil will trigger alerts with mitigation workflows.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(localConfig).map(([cropKey, val]) => (
                  <div
                    key={cropKey}
                    className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="capitalize font-bold text-stone-200 text-sm block">
                        {cropKey}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {cropKey === 'corn' && 'Sensitive during silking/blister (R1-R2)'}
                        {cropKey === 'soybean' && 'Sensitive during pod set and seed fill (R3-R5)'}
                        {cropKey === 'wheat' && 'Deep fibrous root system; critical at heading'}
                        {cropKey === 'oat' && 'Panicle emergence and milk development'}
                        {cropKey === 'pasture' && 'Rotational grazing rest threshold'}
                        {cropKey === 'default' && 'Default fallback for unspecified crops'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="12"
                        max="32"
                        step="1"
                        value={val}
                        onChange={(e) =>
                          setLocalConfig({
                            ...localConfig,
                            [cropKey]: Number(e.target.value),
                          })
                        }
                        className="w-28 accent-emerald-500 cursor-pointer"
                      />
                      <span className="w-12 text-right font-mono font-bold text-emerald-400 text-sm">
                        {val}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setLocalConfig(DEFAULT_CROP_MOISTURE_THRESHOLDS)}
                  className="text-stone-400 hover:text-stone-200 underline text-xs"
                >
                  Reset to Agronomic Defaults
                </button>

                <div className="flex items-center gap-2">
                  {savedSuccess && (
                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                  <button
                    onClick={handleSaveConfig}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
                  >
                    Save Threshold Settings
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
