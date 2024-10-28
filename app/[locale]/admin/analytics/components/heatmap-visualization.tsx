// Copyright (c) 2024 Michael Vacirca michael@michaelvacirca.com
// MIT License
// Path: /app/[locale]/admin/analytics/components/heatmap-visualization.tsx
// Heatmap visualization - showing where democracy is heating up!

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip } from '@/components/ui/tooltip';

interface HeatmapData {
  region: string;
  value: number;
  latitude: number;
  longitude: number;
}

interface HeatmapVisualizationProps {
  data: HeatmapData[];
  title: string;
  maxValue: number;
  colorScale?: (value: number) => string;
}

export function HeatmapVisualization({
  data,
  title,
  maxValue,
  colorScale = defaultColorScale,
}: HeatmapVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] w-full">
          {/* US Map SVG Base */}
          <svg
            viewBox="0 0 959 593"
            className="absolute inset-0 h-full w-full"
          >
            {/* Map paths would go here - simplified for brevity */}
            <g className="states">
              {data.map((point, index) => (
                <circle
                  key={index}
                  cx={point.longitude}
                  cy={point.latitude}
                  r={getRadius(point.value, maxValue)}
                  fill={colorScale(point.value / maxValue)}
                  opacity={0.7}
                  className="transition-all duration-300 hover:opacity-1"
                >
                  <title>
                    {point.region}: {point.value} rides
                  </title>
                </circle>
              ))}
            </g>
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow">
            <div className="flex items-center space-x-2">
              <div className="w-20 h-4 rounded" style={{
                background: 'linear-gradient(to right, #fee8c8, #e34a33)'
              }} />
              <div className="text-xs">
                <div>Low</div>
                <div>High</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function defaultColorScale(value: number): string {
  // Color scale from light orange to dark red
  const colors = ['#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'];
  const index = Math.min(
    Math.floor(value * colors.length),
    colors.length - 1
  );
  return colors[index];
}

function getRadius(value: number, maxValue: number): number {
  const minRadius = 5;
  const maxRadius = 20;
  return minRadius + ((value / maxValue) * (maxRadius - minRadius));
}