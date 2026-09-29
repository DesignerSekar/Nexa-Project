import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

/** App shell footer — same structure as ecom-v2 AppFooter. */
export function AppFooter() {
  return (
    <Footer className="app-footer">
      <div className="app-footer__inner">
        <Text className="app-footer__text">Version 1.0.0</Text>
        <Text className="app-footer__text">
          Copyright &copy; {new Date().getFullYear()} All rights reserved. Nexa
        </Text>
      </div>
    </Footer>
  );
}
