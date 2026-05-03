import TopNav from './TopNav.jsx'
import HeroCards from './HeroCards.jsx'
import ScoreGauges from './ScoreGauges.jsx'
import ProductsTable from './ProductsTable.jsx'
import RevenueChart from './RevenueChart.jsx'
import ScatterPlot from './ScatterPlot.jsx'
import RevenueDonut from './RevenueDonut.jsx'
import BrandLeaderboard from './BrandLeaderboard.jsx'
import AIInsights from './AIInsights.jsx'
import Recommendations from './Recommendations.jsx'
import RiskFlags from './RiskFlags.jsx'
import FooterAccordion from './FooterAccordion.jsx'

function SectionDivider() {
  return <div style={{ height: 1, background: 'var(--line-1)', margin: '24px 0' }} />
}

function SectionLabel({ children, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500,
        color: 'var(--tx-4)', textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {children}
      </span>
      {sub && (
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--tx-4)' }}>
          - {sub}
        </span>
      )}
    </div>
  )
}

export default function Dashboard({ data, darkMode, onToggleDark, onNewAnalysis }) {
  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <TopNav
        query={data.query}
        darkMode={darkMode}
        onToggleDark={onToggleDark}
        onNewAnalysis={onNewAnalysis}
      />

      <div style={{
        width: '100%',
        maxWidth: 'none',
        margin: '0 auto',
        padding: '24px clamp(16px, 2vw, 40px) 60px',
      }}>

        {/* Section 1: Hero Cards */}
        <SectionLabel sub={`${data.query} · amazon.com`}>market_overview</SectionLabel>
        <HeroCards summary={data.summary} />

        <SectionDivider />

        {/* Section 2: Score Gauges */}
        <SectionLabel sub="0-100 scale">competitive_scores</SectionLabel>
        <ScoreGauges scores={data.scores} />

        <SectionDivider />

        {/* Section 3: Products Table */}
        <SectionLabel sub="click column headers to sort">top_products</SectionLabel>
        <ProductsTable products={data.products} />

        <SectionDivider />

        {/* Section 4: Revenue Chart + Scatter Plot */}
        <SectionLabel sub="top listings by estimated monthly revenue">revenue_analysis</SectionLabel>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <RevenueChart products={data.products} />
          </div>
          <div style={{ flex: '1 1 520px', minWidth: 0 }}>
            <ScatterPlot products={data.products} />
          </div>
        </div>

        <SectionDivider />

        {/* Section 5: Revenue Donut + Brand Leaderboard */}
        <SectionLabel>brand_landscape</SectionLabel>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 1 360px', minWidth: 300 }}>
            <RevenueDonut products={data.products} />
          </div>
          <div style={{ flex: '1 1 520px', minWidth: 300 }}>
            <BrandLeaderboard brands={data.brands} />
          </div>
        </div>

        <SectionDivider />

        {/* Section 6: AI Insights */}
        <SectionLabel sub="automated market intelligence">ai_analysis</SectionLabel>
        <AIInsights insights={data.aiInsights} />

        <SectionDivider />

        {/* Section 7: Recommendations + Risk Flags */}
        <SectionLabel>strategy</SectionLabel>
        <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', flexWrap: 'wrap' }}>
          <Recommendations items={data.recommendations} />
          <RiskFlags risks={data.risks} />
        </div>

        <SectionDivider />

        {/* Footer */}
        <FooterAccordion />

      </div>
    </div>
  )
}
