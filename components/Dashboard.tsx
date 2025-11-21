import React, { useState, useMemo } from 'react';
import { StoreData } from '../types';
import { formatCurrency } from '../utils/helpers';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  AlertTriangle, Search, Filter
} from 'lucide-react';

interface DashboardProps {
  data: StoreData[];
  onReset: () => void;
}

const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']; // Red, Yellow, Blue, Green (Q1 to Q4)
const HAVANNA_YELLOW = '#EAB308';
const HAVANNA_RED = '#B91C1C';
const HAVANNA_BLUE = '#3B82F6';

const Dashboard: React.FC<DashboardProps> = ({ data, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuartile, setFilterQuartile] = useState<number | 'all'>('all');

  // --- FILTERED DATA ---
  const filteredData = useMemo(() => {
    return data.filter(store => {
      const matchesName = store.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesQuartile = filterQuartile === 'all' || store.quartile === filterQuartile;
      return matchesName && matchesQuartile;
    });
  }, [data, searchTerm, filterQuartile]);

  // --- TABLE DATA (SORTED BY QUARTILE DESC) ---
  const tableData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      // Sort by Quartile descending (4 to 1)
      if (b.quartile !== a.quartile) {
        return b.quartile - a.quartile;
      }
      // Tie-break with Sell-Out descending
      return b.vlSellOut - a.vlSellOut;
    });
  }, [filteredData]);

  // --- KPIs ---
  const metrics = useMemo(() => {
    const totalSellIn = filteredData.reduce((acc, curr) => acc + curr.vlSellIn, 0);
    const totalSellOut = filteredData.reduce((acc, curr) => acc + curr.vlSellOut, 0);
    const avgTm = filteredData.length > 0 
      ? filteredData.reduce((acc, curr) => acc + curr.tm, 0) / filteredData.length 
      : 0;
    const zeroSellIn = filteredData.filter(s => s.vlSellIn === 0);

    return { totalSellIn, totalSellOut, avgTm, zeroSellIn };
  }, [filteredData]);

  // --- CHART PREP ---

  // 1. Quartile Distribution
  const quartileData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    data.forEach(s => counts[s.quartile]++); // Use 'data' for global distribution context
    return [
      { name: 'Q1 (≤50k)', value: counts[1], color: COLORS[0] },
      { name: 'Q2 (50k-80k)', value: counts[2], color: COLORS[1] },
      { name: 'Q3 (80k-100k)', value: counts[3], color: COLORS[2] },
      { name: 'Q4 (>100k)', value: counts[4], color: COLORS[3] },
    ];
  }, [data]);

  // 2. Top 15 Sell Out
  const top15SellOut = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.vlSellOut - a.vlSellOut)
      .slice(0, 15);
  }, [filteredData]);

  // 3. Top 10 Ticket Médio
  const top10TM = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => b.tm - a.tm)
      .slice(0, 10);
  }, [filteredData]);

  // 4. Comparativo Sell-In x Sell-Out (Line Chart)
  const lineChartData = useMemo(() => {
    // Sort by Sell-Out descending to show trend properly in line chart
    return [...filteredData].sort((a, b) => b.vlSellOut - a.vlSellOut);
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-2 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Painel de Desempenho</h1>
          <p className="text-sm text-gray-500">Análise de Sell-In, Sell-Out e Performance de Lojas</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-end">
           <div className="flex flex-col gap-1 w-full sm:w-64">
            <label className="text-sm font-semibold text-gray-900 ml-0.5">Nome da Loja</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar loja..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
           </div>
          
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <select
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none bg-white w-full"
              value={filterQuartile}
              onChange={(e) => setFilterQuartile(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)}
            >
              <option value="all">Todos Quartis</option>
              <option value="1">1º Quartil (≤ 50k)</option>
              <option value="2">2º Quartil (50-80k)</option>
              <option value="3">3º Quartil (80-100k)</option>
              <option value="4">4º Quartil ({'>'} 100k)</option>
            </select>
          </div>
          
          <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap h-[38px]"
          >
            Novo Arquivo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Sell-Out" 
          value={formatCurrency(metrics.totalSellOut)} 
          icon={<TrendingUp className="w-5 h-5 text-green-600" />} 
          trend="Receita Realizada"
          color="bg-green-50 border-green-100"
        />
        <KpiCard 
          title="Total Sell-In" 
          value={formatCurrency(metrics.totalSellIn)} 
          icon={<ShoppingBag className="w-5 h-5 text-blue-600" />} 
          trend="Compras Lojas"
          color="bg-blue-50 border-blue-100"
        />
        <KpiCard 
          title="Ticket Médio Geral" 
          value={formatCurrency(metrics.avgTm)} 
          icon={<DollarSign className="w-5 h-5 text-yellow-600" />} 
          trend="Média da Rede"
          color="bg-yellow-50 border-yellow-100"
        />
        <KpiCard 
          title="Lojas Sem Sell-In" 
          value={metrics.zeroSellIn.length.toString()} 
          icon={<AlertTriangle className="w-5 h-5 text-red-600" />} 
          trend="Atenção Necessária"
          color="bg-red-50 border-red-100"
          highlight={metrics.zeroSellIn.length > 0}
        />
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranking Sell-Out */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 15 Lojas (Sell-Out)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top15SellOut} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vlSellOut" fill={HAVANNA_YELLOW} radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quartiles */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Quartis</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={quartileData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {quartileData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-gray-500 mt-2 space-y-1">
            <p><span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>Q1: Até R$ 50k</p>
            <p><span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>Q2: R$ 50k - R$ 80k</p>
            <p><span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>Q3: R$ 80k - R$ 100k</p>
            <p><span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>Q4: Acima de R$ 100k</p>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Top 10 TM */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 10 - Ticket Médio</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10TM} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tickFormatter={(val) => `R$${val}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="tm" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Line Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparativo: Sell-In vs Sell-Out</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis 
                  tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} 
                  tick={{fontSize: 12, fill: '#6B7280'}}
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="vlSellOut" 
                  name="Sell-Out" 
                  stroke={HAVANNA_YELLOW} 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vlSellIn" 
                  name="Sell-In" 
                  stroke={HAVANNA_BLUE} 
                  strokeWidth={2} 
                  dot={{ r: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {metrics.zeroSellIn.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Lojas sem compra (Zero Sell-In)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Loja</th>
                  <th className="px-6 py-3">Sell-Out Realizado</th>
                  <th className="px-6 py-3 text-right">Quartil Atual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {metrics.zeroSellIn.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">{store.name}</td>
                    <td className="px-6 py-3 text-gray-600">{formatCurrency(store.vlSellOut)}</td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${store.quartile === 4 ? 'bg-green-100 text-green-800' : 
                          store.quartile === 3 ? 'bg-blue-100 text-blue-800' :
                          store.quartile === 2 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}>
                        Q{store.quartile}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detailed Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Detalhamento de Lojas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-6 py-3">Loja</th>
                <th className="px-6 py-3 text-right">Sell-In</th>
                <th className="px-6 py-3 text-right">Sell-Out</th>
                <th className="px-6 py-3 text-right">Ticket Médio</th>
                <th className="px-6 py-3 text-center">Quartil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableData.slice(0, 50).map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(store.vlSellIn)}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">{formatCurrency(store.vlSellOut)}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(store.tm)}</td>
                  <td className="px-6 py-3 text-center">
                     <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-bold text-white
                        ${store.quartile === 4 ? 'bg-green-500' : 
                          store.quartile === 3 ? 'bg-blue-500' :
                          store.quartile === 2 ? 'bg-yellow-500' : 
                          'bg-red-500'}`}>
                        {store.quartile}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper component for KPI Cards
interface KpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  color: string;
  highlight?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, color, highlight = false }) => (
  <div className={`p-6 rounded-xl shadow-sm border transition-all duration-200 hover:shadow-md ${color} ${highlight ? 'ring-2 ring-red-400 ring-offset-2' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-2 rounded-lg bg-white/60`}>
        {icon}
      </div>
    </div>
    <div className="flex items-center text-xs font-medium text-gray-500">
      <span>{trend}</span>
    </div>
  </div>
);

export default Dashboard;