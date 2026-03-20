import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  Circle,
  Rect,
  Defs,
  LinearGradient,
  Stop
} from '@react-pdf/renderer'
import { AnalysisReport } from '../../types'

// Define premium Nexora color palette
const colors = {
  background: '#0a0a0a',
  surface: '#121212',
  surfaceLight: '#1e1e1e',
  primary: '#2563eb', // Vibrant Blue
  secondary: '#0ea5e9', // Sky Blue
  accent: '#10b981', // Emerald
  warning: '#f59e0b', // Amber
  critical: '#ef4444', // Red
  text: '#ffffff',
  textSecondary: '#a3a3a3',
  textMuted: '#525252',
  border: '#262626',
  divider: '#171717'
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text
  },
  content: {
    padding: 40,
    flex: 1
  },
  // Cover Page
  coverPage: {
    backgroundColor: colors.background,
    height: '100%',
    padding: 60,
    flexDirection: 'column',
    justifyContent: 'center',
    display: 'flex'
  },
  coverBrand: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20
  },
  coverTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
    lineHeight: 1.1
  },
  coverSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 60
  },
  coverInfoBlock: {
    marginTop: 40,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
    paddingLeft: 20
  },
  coverInfoItem: {
    marginBottom: 15
  },
  coverInfoLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4
  },
  coverInfoValue: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: 'bold'
  },
  // Generic Section
  section: {
    marginBottom: 30
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingBottom: 10
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: colors.text
  },
  sectionNumber: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: 'bold',
    marginRight: 10,
    fontFamily: 'Helvetica-Bold'
  },
  // Typography
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 8
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.textSecondary,
    marginBottom: 10
  },
  mono: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: colors.primary
  },
  // Cards & Blocks
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border
  },
  highlightBox: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    padding: 15,
    borderRadius: 4,
    marginBottom: 15
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    paddingHorizontal: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider
  },
  footerText: {
    fontSize: 7,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1
  }
})

// Visual Components
const NeuralPattern = () => (
  <Svg
    style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, opacity: 0.15 }}
    viewBox='0 0 400 400'
  >
    <Circle cx='300' cy='100' r='2' fill={colors.primary} />
    <Circle cx='350' cy='150' r='2' fill={colors.primary} />
    <Circle cx='250' cy='180' r='2' fill={colors.secondary} />
    <Circle cx='320' cy='250' r='2' fill={colors.primary} />
    <Path
      d='M300 100 L350 150 M350 150 L250 180 M250 180 L320 250 M300 100 L250 180'
      stroke={colors.primary}
      strokeWidth='0.5'
    />
  </Svg>
)

const SectionSeparator = () => (
  <View style={{ height: 1, width: '100%', backgroundColor: colors.divider, marginVertical: 20 }} />
)

interface AnalysisPDFProps {
  report: AnalysisReport
  query?: string
}

const AnalysisPDF: React.FC<AnalysisPDFProps> = ({ report, query = 'Market Intelligence' }) => {
  const generatedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <Document>
      {/* 1. COVER PAGE */}
      <Page size='A4' style={styles.page}>
        <NeuralPattern />
        <View style={styles.coverPage}>
          <Text style={styles.coverBrand}>Nexora Intelligence</Text>
          <Text style={styles.coverTitle}>AI Competitive Intelligence Report</Text>
          <Text style={styles.coverSubtitle}>Strategic Market Assessment</Text>

          <View style={styles.coverInfoBlock}>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Report Topic</Text>
              <Text style={styles.coverInfoValue}>{query}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Generated Date</Text>
              <Text style={styles.coverInfoValue}>{generatedDate}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Engine Version</Text>
              <Text style={styles.coverInfoValue}>Nexora Alpha v2.8</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Prepared By</Text>
              <Text style={styles.coverInfoValue}>Nexora Intelligence Engine</Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora — AI-powered market intelligence</Text>
        </View>
      </Page>

      {/* 2. EXECUTIVE SUMMARY */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.h3}>Core Strategic Insight</Text>
            <Text style={styles.paragraph}>{report.executiveSummary}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.coverInfoLabel}>Market Signal</Text>
              <Text style={[styles.coverInfoValue, { color: colors.accent }]}>Strong</Text>
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.coverInfoLabel}>Strategic Opportunity</Text>
              <Text style={[styles.coverInfoValue, { color: colors.secondary }]}>High Expansion</Text>
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.coverInfoLabel}>Risk Index</Text>
              <Text style={[styles.coverInfoValue, { color: colors.warning }]}>Moderate</Text>
            </View>
          </View>

          <View style={[styles.section, { marginTop: 20 }]}>
            <Text style={styles.h3}>Strategic Objectives</Text>
            {report.validationNextSteps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 6 }}>
                <Text style={{ color: colors.primary, marginRight: 8 }}>•</Text>
                <Text style={styles.paragraph}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 2</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 3. MARKET SIGNALS */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Market Signals</Text>
          </View>

          {report.weaknessMatrix.slice(0, 3).map((w, i) => (
            <View key={i} style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.h3}>{w.name}</Text>
                <View style={[styles.badge, { backgroundColor: w.frequency === 'High' ? colors.primary : colors.surfaceLight }]}>
                  <Text style={{ color: colors.text, fontSize: 7 }}>{w.frequency} Strength</Text>
                </View>
              </View>
              <Text style={styles.paragraph}>{w.monetizationSignals}</Text>
              <View style={{ marginTop: 10, height: 4, backgroundColor: colors.surfaceLight, borderRadius: 2 }}>
                <View style={{ height: 4, width: w.frequency === 'High' ? '90%' : w.frequency === 'Medium' ? '60%' : '30%', backgroundColor: colors.primary, borderRadius: 2 }} />
              </View>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 3</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 4. USER PAIN POINTS */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>User Pain Points</Text>
          </View>

          {report.weaknessMatrix.map((w, i) => (
            <View key={i} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: w.painIntensity === 'Severe' ? colors.critical : colors.warning }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.h3}>{w.name}</Text>
                <Text style={[styles.badge, { color: w.painIntensity === 'Severe' ? colors.critical : colors.warning }]}>{w.painIntensity}</Text>
              </View>
              <Text style={[styles.paragraph, { fontStyle: 'italic', color: colors.textSecondary }]}>
                "{w.quotes[0]?.slice(0, 150)}..."
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 10, gap: 10 }}>
                <Text style={styles.mono}>SIGNIFICANCE:</Text>
                <Text style={styles.paragraph}>{w.significance.slice(0, 100)}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 4</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 5. COMPETITIVE INTELLIGENCE */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Competitive Intelligence</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.h3}>Observed Market Vulnerabilities</Text>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
              {report.weaknessMatrix.map((w, i) => (
                <View key={i} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider }}>
                  <Text style={[styles.coverInfoValue, { marginBottom: 4 }]}>{w.name}</Text>
                  {w.competitorsAffected.map((c, ci) => (
                    <View key={ci} style={{ flexDirection: 'row', marginBottom: 2 }}>
                      <Text style={[styles.mono, { width: 100 }]}>{c.name.toUpperCase()}:</Text>
                      <Text style={[styles.paragraph, { flex: 1 }]}>{c.failureMode}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 5</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 6. OPPORTUNITY LANDSCAPE */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Opportunity Landscape</Text>
          </View>

          {report.comparisonTable.map((row, i) => (
            <View key={i} style={[styles.card, i === 0 ? { borderColor: colors.primary, backgroundColor: 'rgba(37, 99, 235, 0.05)' } : {}]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.h3, i === 0 ? { color: colors.primary } : {}]}>
                  {i === 0 ? '★ ' : ''}{row.weakness}
                </Text>
                <Text style={[styles.badge, { backgroundColor: colors.surfaceLight }]}>Score: {row.opportunityScore}/5</Text>
              </View>
              <Text style={styles.paragraph}>{row.whyBuildThis}</Text>
              <View style={{ flexDirection: 'row', gap: 15, marginTop: 10 }}>
                <View>
                  <Text style={styles.coverInfoLabel}>Moat Potential</Text>
                  <Text style={styles.mono}>{row.moat}</Text>
                </View>
                <View>
                  <Text style={styles.coverInfoLabel}>Confidence</Text>
                  <Text style={styles.mono}>HIGH</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 6</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 7. AI INSIGHT HIGHLIGHTS */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>06</Text>
            <Text style={styles.sectionTitle}>AI Insight Highlights</Text>
          </View>

          <View style={{ gap: 20 }}>
            <View style={[styles.card, { borderLeftWidth: 2, borderLeftColor: colors.secondary }]}>
              <Text style={[styles.paragraph, { fontSize: 12, color: colors.text }]}>{report.strategicRecommendations.strongestOpportunity}</Text>
              <Text style={[styles.mono, { marginTop: 10 }]}>// PRIMARY VECTOR</Text>
            </View>
            <View style={[styles.card, { borderLeftWidth: 2, borderLeftColor: colors.accent }]}>
              <Text style={styles.paragraph}>{report.strategicRecommendations.quickWinAlternative}</Text>
              <Text style={[styles.mono, { marginTop: 10 }]}>// RAPID IMPLEMENTATION</Text>
            </View>
            <View style={[styles.card, { borderLeftWidth: 2, borderLeftColor: colors.warning }]}>
              <Text style={styles.paragraph}>{report.strategicRecommendations.redFlags}</Text>
              <Text style={[styles.mono, { marginTop: 10, color: colors.warning }]}>// CRITICAL RISK ADVISORY</Text>
            </View>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 7</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>

      {/* 8. STRATEGIC TAKEAWAYS (CONCLUSION) */}
      <Page size='A4' style={styles.page}>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>07</Text>
            <Text style={styles.sectionTitle}>Strategic Takeaways</Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={styles.h3}>Final Assessment</Text>
            <Text style={styles.paragraph}>
              The competitive landscape for "{query}" shows significant gaps in user experience and operational efficiency. 
              The most viable path forward involves {report.strategicRecommendations.strongestOpportunity.slice(0, 100).toLowerCase()}...
            </Text>
          </View>

          <View style={{ marginTop: 20 }}>
            <Text style={styles.h3}>Recommended Next Steps</Text>
            {report.validationNextSteps.map((step, i) => (
              <View key={i} style={{ marginBottom: 15 }}>
                <Text style={styles.mono}>STEP {i + 1}:</Text>
                <Text style={styles.paragraph}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Svg width='100' height='2' viewBox='0 0 100 2'>
              <Rect width='100' height='1' fill={colors.divider} />
            </Svg>
            <Text style={[styles.footerText, { marginTop: 10 }]}>End of Intelligence Briefing</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText}>Page 8</Text>
          <Text style={styles.footerText}>Generated by Nexora AI</Text>
        </View>
      </Page>
    </Document>
  )
}

export default AnalysisPDF
