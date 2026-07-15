import { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Filter, Plus, ChevronDown, ArrowRight, MoreHorizontal } from 'lucide-react';

const analyticsData = [
  { name: 'JAN', sales: 1200, average: 2000 },
  { name: 'FEB', sales: 2100, average: 2200 },
  { name: 'MAR', sales: 1800, average: 2400 },
  { name: 'APR', sales: 2400, average: 2600 },
  { name: 'MAY', sales: 4800, average: 3000 },
  { name: 'JUN', sales: 3200, average: 2800 },
  { name: 'JUL', sales: 2900, average: 3200 },
  { name: 'AUG', sales: 4100, average: 3400 },
];

const topProducts = [
  { id: 1, name: 'iPhone 15 Pro Max', sales: 127, revenue: 1890, stock: 120, status: 'In Stock' },
  { id: 2, name: 'MacBook Air M3', sales: 540, revenue: 2889, stock: 100, status: 'Out of stock' },
  { id: 3, name: 'Sony WH-1000XM5', sales: 320, revenue: 1250, stock: 45, status: 'In Stock' },
  { id: 4, name: 'Samsung Galaxy S24', sales: 410, revenue: 2100, stock: 0, status: 'Out of stock' },
];

const visitData = [
  { day: 'MON', value: 80, isHighest: false },
  { day: 'TUE', value: 45, isHighest: false },
  { day: 'WED', value: 100, isHighest: true },
  { day: 'THU', value: 65, isHighest: false },
  { day: 'FRI', value: 50, isHighest: false },
];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('This month');

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Track your traffic and performance of your strategy</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 transition shadow-sm">
            <Plus className="h-4 w-4" /> Add Widget
          </button>
        </div>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Overview Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm col-span-1 md:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product overview</span>
            <button className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50">
              {timeRange} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="mb-6 flex items-end gap-2">
            <h2 className="text-3xl font-bold text-gray-900">130,491</h2>
            <span className="text-sm text-gray-500 mb-1">Total products</span>
          </div>
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-600 font-medium">Select by category</span>
            <span className="text-gray-400">New index: 453 <ChevronDown className="inline h-3 w-3" /></span>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-orange-500 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition text-center">
              Electronics
            </button>
            <button className="flex-1 rounded-xl bg-orange-100 py-2.5 text-xs font-semibold text-orange-600 hover:bg-orange-200 transition text-center">
              Accessories
            </button>
          </div>
        </div>

        {/* Active Sales / Traffic Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active shops</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">1,285</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">vs last month</span>
                  <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-bold text-green-600">+12%</span>
                </div>
              </div>
              <div className="h-12 w-16 flex items-end gap-1">
                 <div className="w-1/3 bg-orange-500 rounded-t-sm" style={{height: '60%'}}></div>
                 <div className="w-1/3 bg-orange-300 rounded-t-sm" style={{height: '100%'}}></div>
                 <div className="w-1/3 bg-orange-200 rounded-t-sm" style={{height: '40%'}}></div>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-3">
             <button className="text-xs font-semibold text-gray-900 flex items-center gap-1 hover:text-orange-600 transition">
               See Details <ArrowRight className="h-3 w-3" />
             </button>
          </div>
        </div>

        {/* Product Revenue / Index Rate Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Index Rate</span>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">94.2%</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">vs last month</span>
                  <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[11px] font-bold text-green-600">+7%</span>
                </div>
              </div>
              <div className="h-14 w-14 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{value: 94}, {value: 6}]}
                      cx="50%" cy="50%"
                      innerRadius={18}
                      outerRadius={24}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#F97316" />
                      <Cell fill="#FFF7ED" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-100 pt-3">
             <button className="text-xs font-semibold text-gray-900 flex items-center gap-1 hover:text-orange-600 transition">
               See Details <ArrowRight className="h-3 w-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Middle Row (Analytics Chart + Sales Gauge) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analytics Chart */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Analytics</span>
                <div className="flex gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-gray-900">4,543,000</span>
                       <span className="text-sm text-gray-400">visits</span>
                       <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500">-0.4%</span>
                    </div>
                  </div>
                  <div className="w-px bg-gray-200"></div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-gray-900">1.73%</span>
                       <span className="text-sm text-gray-400">Conv.rate</span>
                       <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">+13%</span>
                    </div>
                  </div>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  This year <ChevronDown className="h-3 w-3" />
                </button>
                <button className="flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
                  <Filter className="h-3 w-3" /> Filters
                </button>
             </div>
          </div>
          <div className="h-[240px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                  <pattern id="diagonalHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#F97316" strokeWidth="1" strokeOpacity="0.2" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="average" stroke="none" fill="url(#diagonalHatch)" />
                <Area type="monotone" dataKey="sales" stroke="#F97316" strokeWidth={3} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Performance Gauge */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1 flex flex-col items-center relative">
           <div className="w-full text-left mb-6">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Performance</span>
           </div>
           
           <div className="relative w-48 h-48 flex items-center justify-center">
             {/* Simple CSS-based gauge arc for precision matching the screenshot */}
             <div className="absolute inset-0 rounded-full border-[12px] border-orange-100" style={{clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'}}></div>
             <div className="absolute inset-0 rounded-full border-[12px] border-orange-500" style={{clipPath: 'polygon(0 0, 40% 0, 40% 50%, 0 50%)'}}></div>
             <div className="absolute inset-2 rounded-full border-[8px] border-orange-200 opacity-50" style={{clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'}}></div>
             
             <div className="text-center -mt-6">
               <h3 className="text-3xl font-bold text-gray-900">17.9%</h3>
               <p className="text-xs text-gray-400 mt-1">Since yesterday</p>
             </div>
           </div>

           <div className="mt-auto w-full border-t border-gray-100 pt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-1 bg-orange-500 rounded-full"></div>
                   <span className="font-medium text-gray-900">Total Index per day</span>
                 </div>
                 <span className="text-gray-400">For week</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-1 bg-orange-200 rounded-full"></div>
                   <span className="font-medium text-gray-900">Average Index</span>
                 </div>
                 <span className="text-gray-400">For today</span>
              </div>
           </div>
           <div className="w-full border-t border-gray-100 pt-3 mt-4">
             <button className="text-xs font-semibold text-gray-900 flex items-center gap-1 hover:text-orange-600 transition w-full justify-center">
               See Details <ArrowRight className="h-3 w-3" />
             </button>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total visits by hourly */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:col-span-1">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                   <Users className="h-5 w-5" />
                 </div>
                 <div>
                   <span className="text-[10px] font-semibold text-gray-400 uppercase">Total visits by hourly</span>
                   <div className="flex items-center gap-2 mt-0.5">
                     <h3 className="text-xl font-bold text-gray-900">288,822</h3>
                     <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-600">+4%</span>
                   </div>
                 </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
           </div>
           
           <div className="h-[120px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={visitData} layout="vertical" margin={{top: 0, right: 0, left: -20, bottom: 0}}>
                 <XAxis type="number" hide />
                 <YAxis type="category" dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 600}} />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                   {
                     visitData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.isHighest ? '#F97316' : '#FFEDD5'} />
                     ))
                   }
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Top Products Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-gray-50">
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Top Products</span>
             <button className="text-xs font-semibold text-orange-500 flex items-center gap-1 hover:text-orange-600 transition">
               See Details <ArrowRight className="h-3 w-3" />
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Views</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Revenue</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                  <th className="px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-4">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                             {product.name.charAt(0)}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{product.name}</span>
                       </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{product.sales}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">${product.revenue}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-5 py-4 text-right">
                       <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                         product.status === 'In Stock' 
                           ? 'bg-indigo-50 text-indigo-600'
                           : 'bg-red-50 text-red-500'
                       }`}>
                         {product.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
