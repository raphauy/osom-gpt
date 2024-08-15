import { BarChartHorizontal } from "@/components/charts/bar-chart-horizontal";
import { IndicatorResult } from "@/services/analytics-service";

type Props= {
    indicators: IndicatorResult[]
    disabled?: boolean
}
export default function GeneralDataPage({ indicators, disabled }: Props) {
  if (disabled) return null
  
  return (
    <div className="flex flex-col gap-4 w-full p-6">
        
        {
            indicators.map((indicator, index) => (
                <BarChartHorizontal key={index} indicator={indicator} />
            ))
        }        
    </div>
  );
}