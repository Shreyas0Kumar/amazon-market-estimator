import SemiGauge from './SemiGauge.jsx'

export default function ScoreGauges({ data }) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <SemiGauge
        score={data.competitiveness.score}
        label={data.competitiveness.label}
        type="competition"
        factors={data.competitiveness.factors}
      />
      <SemiGauge
        score={data.opportunity.score}
        label={data.opportunity.label}
        type="opportunity"
        factors={data.opportunity.factors}
      />
    </div>
  )
}
