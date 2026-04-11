import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Rect,
} from '@react-pdf/renderer'
import { AnalysisReport } from '../../types'

// Modern Light SaaS Theme for clean, professional PDF printing/viewing
const colors = {
  background: '#ffffff',
  surface: '#f8fafc', // slate-50
  surfaceLight: '#f1f5f9', // slate-100
  primary: '#2563eb', // blue-600
  secondary: '#3b82f6', // blue-500
  accent: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  critical: '#ef4444', // red-500
  text: '#0f172a', // slate-900
  textSecondary: '#334155', // slate-700
  textMuted: '#64748b', // slate-500
  border: '#e2e8f0', // slate-200
  divider: '#f1f5f9' // slate-100
}

const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingTop: 70,
    paddingBottom: 70,
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.text
  },
  coverPage: {
    padding: 0,
    backgroundColor: '#0a0a0a', // Keep cover dark and striking
    color: '#ffffff',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: 'Helvetica'
  },
  coverContent: {
    padding: 60,
    flex: 1,
    justifyContent: 'center'
  },
  coverBrand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
    fontFamily: 'Helvetica-Bold'
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: 1.2,
    fontFamily: 'Helvetica-Bold'
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#a3a3a3',
    marginBottom: 60,
    lineHeight: 1.4
  },
  coverInfoBlock: {
    marginTop: 40,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingLeft: 24
  },
  coverInfoItem: {
    marginBottom: 16
  },
  coverInfoLabel: {
    fontSize: 9,
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold'
  },
  coverInfoValue: {
    fontSize: 12,
    color: '#e5e5e5',
    fontFamily: 'Helvetica-Bold'
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10
  },
  headerText: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Helvetica-Bold'
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
    letterSpacing: 0.5
  },
  section: {
    marginBottom: 35
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.surfaceLight,
    paddingBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    fontFamily: 'Helvetica-Bold'
  },
  sectionNumber: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 10,
    fontFamily: 'Helvetica-Bold'
  },
  h3: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold'
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  highlightBox: {
    backgroundColor: '#eff6ff', // blue-50
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 16,
    borderRadius: 6,
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  col: {
    flex: 1
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 8,
    color: colors.background,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase'
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 4
  },
  bulletPoint: {
    width: 12,
    fontSize: 10,
    color: colors.primary,
    fontFamily: 'Helvetica-Bold'
  }
})

// Visual Components
const NeuralPattern = () => (
  <Svg
    style={{ position: 'absolute', top: 0, right: 0, width: 400, height: 400, opacity: 0.1 }}
    viewBox='0 0 400 400'
  >
    <Circle cx='300' cy='100' r='3' fill={colors.primary} />
    <Circle cx='350' cy='150' r='2' fill={colors.primary} />
    <Circle cx='250' cy='180' r='3' fill={colors.accent} />
    <Circle cx='320' cy='250' r='2' fill={colors.primary} />
    <Path
      d='M300 100 L350 150 M350 150 L250 180 M250 180 L320 250 M300 100 L250 180'
      stroke={colors.primary}
      strokeWidth='1'
    />
  </Svg>
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

  const renderBadge = (text: string, level: 'high' | 'medium' | 'low') => {
    let bg = colors.textMuted
    if (level === 'high') bg = colors.primary
    if (level === 'medium') bg = colors.warning
    if (level === 'low') bg = colors.textMuted
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text>{text}</Text>
      </View>
    )
  }

  return (
    <Document>
      {/* 1. COVER PAGE - Dark theme for impact */}
      <Page size='A4' style={styles.coverPage}>
        <NeuralPattern />
        <View style={styles.coverContent}>
          <Text style={styles.coverBrand}>Nexora Intelligence</Text>
          <Text style={styles.coverTitle}>Competitive Intelligence Report</Text>
          <Text style={styles.coverSubtitle}>Strategic Market Assessment</Text>

          <View style={styles.coverInfoBlock}>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Target Subject</Text>
              <Text style={styles.coverInfoValue}>{query}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Date Generated</Text>
              <Text style={styles.coverInfoValue}>{generatedDate}</Text>
            </View>
            <View style={styles.coverInfoItem}>
              <Text style={styles.coverInfoLabel}>Analysis Engine</Text>
              <Text style={styles.coverInfoValue}>Nexora AI Alpha</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* 2. MAIN CONTENT - Flows continuously without forcing blank pages */}
      <Page size='A4' style={styles.page} wrap={true}>
        
        {/* FIXED HEADER */}
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>Nexora Intelligence</Text>
          <Text style={styles.headerText}>{query}</Text>
        </View>

        {/* EXECUTIVE SUMMARY */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>01</Text>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
          </View>

          <View style={styles.highlightBox}>
            <Text style={[styles.h3, { color: colors.primary }]}>Core Strategic Insight</Text>
            <Text style={styles.paragraph}>{report.executiveSummary}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Market Signal</Text>
              <Text style={[styles.h3, { color: colors.primary, marginBottom: 0 }]}>Strong</Text>
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Growth Potential</Text>
              <Text style={[styles.h3, { color: colors.accent, marginBottom: 0 }]}>High Expansion</Text>
            </View>
            <View style={[styles.card, styles.col]}>
              <Text style={styles.coverInfoLabel}>Risk Index</Text>
              <Text style={[styles.h3, { color: colors.warning, marginBottom: 0 }]}>Moderate</Text>
            </View>
          </View>
        </View>

        {/* MARKET SIGNALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>02</Text>
            <Text style={styles.sectionTitle}>Market Signals & Weaknesses</Text>
          </View>

          {report.weaknessMatrix.map((w, i) => (
            <View key={i} style={styles.card} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={styles.h3}>{w.name}</Text>
                {renderBadge(
                  `${w.frequency} Signal`, 
                  w.frequency === 'High' ? 'high' : w.frequency === 'Medium' ? 'medium' : 'low'
                )}
              </View>
              <Text style={styles.paragraph}>{w.monetizationSignals}</Text>
              <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.mono, { marginRight: 8 }]}>Pain Intensity:</Text>
                <Text style={[styles.paragraph, { marginBottom: 0, fontWeight: 'bold', color: w.painIntensity === 'Severe' ? colors.critical : colors.warning }]}>
                  {w.painIntensity}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* OPPORTUNITY LANDSCAPE */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>03</Text>
            <Text style={styles.sectionTitle}>Opportunity Landscape</Text>
          </View>

          {report.comparisonTable.map((row, i) => (
            <View key={i} style={[styles.card, i === 0 ? { borderColor: colors.primary, backgroundColor: '#eff6ff' } : {}]} wrap={false}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[styles.h3, i === 0 ? { color: colors.primary } : {}]}>
                  {i === 0 ? '🏆 ' : ''}{row.weakness}
                </Text>
                <Text style={[styles.badge, { backgroundColor: colors.secondary, color: '#fff' }]}>
                  Score: {row.opportunityScore}/5
                </Text>
              </View>
              <Text style={styles.paragraph}>{row.whyBuildThis}</Text>
              <View style={{ flexDirection: 'row', gap: 15, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View style={styles.col}>
                  <Text style={[styles.coverInfoLabel, { fontSize: 7 }]}>Moat Potential</Text>
                  <Text style={styles.mono}>{row.moat}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* AI STRATEGIC RECOMMENDATIONS */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>04</Text>
            <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
          </View>

          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <Text style={styles.coverInfoLabel}>Primary Opportunity Vector</Text>
            <Text style={[styles.paragraph, { color: colors.text, marginTop: 4 }]}>
              {report.strategicRecommendations.strongestOpportunity}
            </Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.card, styles.col, { borderLeftWidth: 4, borderLeftColor: colors.accent }]}>
              <Text style={styles.coverInfoLabel}>Quick Win Alternative</Text>
              <Text style={[styles.paragraph, { marginTop: 4 }]}>
                {report.strategicRecommendations.quickWinAlternative}
              </Text>
            </View>
            <View style={[styles.card, styles.col, { borderLeftWidth: 4, borderLeftColor: colors.warning }]}>
              <Text style={styles.coverInfoLabel}>Critical Risk Advisory</Text>
              <Text style={[styles.paragraph, { marginTop: 4 }]}>
                {report.strategicRecommendations.redFlags}
              </Text>
            </View>
          </View>
        </View>

        {/* VALIDATION & NEXT STEPS */}
        <View style={styles.section} wrap={false}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionNumber}>05</Text>
            <Text style={styles.sectionTitle}>Actionable Next Steps</Text>
          </View>

          <View style={styles.card}>
            {report.validationNextSteps.map((step, i) => (
              <View key={i} style={styles.bulletItem}>
                <Text style={styles.bulletPoint}>{(i + 1).toString().padStart(2, '0')}.</Text>
                <Text style={[styles.paragraph, { flex: 1, marginBottom: 0 }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FIXED FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Nexora Intelligence Report</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
          <Text style={styles.footerText}>Generated securely by AI</Text>
        </View>

      </Page>
    </Document>
  )
}

export default AnalysisPDF
