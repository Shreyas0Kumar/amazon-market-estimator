import TopNav from './TopNav.jsx'
import HeroCards from './HeroCards.jsx'
import ScoreGauges from './ScoreGauges.jsx'
import ProductsTable from './ProductsTable.jsx'
import RevenueChart from './RevenueChart.jsx'
import ScatterPlot from './ScatterPlot.jsx'
import DistributionChart from './DistributionChart.jsx'
import BrandLeaderboard from './BrandLeaderboard.jsx'
import AIInsights from './AIInsights.jsx'
import Recommendations from './Recommendations.jsx'
import RiskFlags from './RiskFlags.jsx'
import FooterAccordion from './FooterAccordion.jsx'

function SectionDivider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '32px 0' }} />
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
      color: 'var(--border-mid)', textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 16,
    }}>
      {children}
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

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 28px 60px' }}>

        {/* Section 1: Hero Cards */}
        <HeroCards summary={data.summary} />

        <SectionDivider />

        {/* Section 2: Score Gauges */}
        <SectionLabel>Market Scores</SectionLabel>
        <ScoreGauges scores={data.scores} />

        <SectionDivider />

        {/* Section 3: Products Table */}
        <SectionLabel>Top Competitors</SectionLabel>
        <ProductsTable products={data.products} />

        <SectionDivider />

        {/* Section 4: Revenue Chart + Scatter Plot */}
        <SectionLabel>Revenue & Pricing Analysis</SectionLabel>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <RevenueChart products={data.products} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <ScatterPlot products={data.products} />
          </div>
        </div>

        <SectionDivider />

        {/* Section 5: Distribution Chart */}
        <SectionLabel>Market Distributions</SectionLabel>
        <DistributionChart
          priceDistribution={data.priceDistribution}
          ratingDistribution={data.ratingDistribution}
          reviewDistribution={data.reviewDistribution}
        />

        <SectionDivider />

        {/* Section 6: Brand Leaderboard + AI Insights */}
        <SectionLabel>Brand Landscape & AI Analysis</SectionLabel>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ width: 260, flexShrink: 0 }}>
            <BrandLeaderboard brands={data.brands} />
          </div>
          <AIInsights insights={data.aiInsights} />
        </div>

        <SectionDivider />

        {/* Section 7: Recommendations + Risk Flags */}
        <SectionLabel>Action Plan</SectionLabel>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
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
