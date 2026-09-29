import { Card, Col, Row, Typography } from 'antd';

const { Text } = Typography;

interface BreakdownPanelsProps {
  priorityBreakdown: Record<string, number>;
  classifierBreakdown: Record<string, number>;
}

function BreakdownList({ entries }: { entries: [string, number][] }) {
  return (
    <ul className="dashboard-breakdown-list">
      {entries.map(([label, count]) => (
        <li key={label} className="dashboard-breakdown-row">
          <Text className="dashboard-breakdown-row__label">{label}</Text>
          <Text className="dashboard-breakdown-row__value">{count}</Text>
        </li>
      ))}
    </ul>
  );
}

/**
 * Twin panels for priority and classifier breakdowns.
 * A panel is omitted when its map is empty.
 */
export function BreakdownPanels({ priorityBreakdown, classifierBreakdown }: BreakdownPanelsProps) {
  const priorityEntries = Object.entries(priorityBreakdown);
  const classifierEntries = Object.entries(classifierBreakdown);

  if (priorityEntries.length === 0 && classifierEntries.length === 0) {
    return null;
  }

  return (
    <div className="dashboard-twin-sections">
      <Row gutter={[16, 16]} className="dashboard-equal-row">
        {priorityEntries.length > 0 ? (
          <Col xs={24} lg={classifierEntries.length > 0 ? 12 : 24}>
            <Card
              className="dashboard-panel"
              title={
                <Text strong className="dashboard-panel__title">
                  Priority breakdown
                </Text>
              }
            >
              <BreakdownList entries={priorityEntries} />
            </Card>
          </Col>
        ) : null}
        {classifierEntries.length > 0 ? (
          <Col xs={24} lg={priorityEntries.length > 0 ? 12 : 24}>
            <Card
              className="dashboard-panel"
              title={
                <Text strong className="dashboard-panel__title">
                  Classifier breakdown
                </Text>
              }
            >
              <BreakdownList entries={classifierEntries} />
            </Card>
          </Col>
        ) : null}
      </Row>
    </div>
  );
}
