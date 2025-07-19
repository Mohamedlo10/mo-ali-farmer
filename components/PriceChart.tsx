"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface PriceData {
  date: string;
  price: number;
}

interface PriceChartProps {
  data: PriceData[];
  title: string;
}

export default function PriceChart({ data, title }: PriceChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM/yy'),
  }));

  return (
    <div className="border rounded p-4 shadow text-green-800 bg-white">
      <h3 className="text-lg font-bold text-center mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={formattedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="price" stroke="#16a34a" activeDot={{ r: 8 }} name="Prix (FCFA)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
