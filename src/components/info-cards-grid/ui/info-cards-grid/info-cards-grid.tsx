import { Col, Row, type ColProps } from "antd";

import type { InfoCardGridItem } from "../../model/types";
import { InfoCard } from "../info-card/info-card";
import { InfoCardTextValue } from "../info-card/info-card-text-value";
import { InfoCardValue } from "../info-card/info-card-value";

import styles from "./info-cards-grid.module.css";

const DEFAULT_COL_PROPS: ColProps = { xs: 12, xl: 6 };

export type InfoCardsGridProps = {
  items: InfoCardGridItem[];
  colProps?: ColProps;
};

export function InfoCardsGrid({ items, colProps = DEFAULT_COL_PROPS }: InfoCardsGridProps) {
  return (
    <Row gutter={[16, 16]} align="stretch">
      {items.map((item) => (
        <Col key={item.key} {...colProps} className={styles.tileCol}>
          <InfoCard title={item.title} copyText={item.copyText}>
            {typeof item.value === "string" ? (
              <InfoCardTextValue text={item.value} />
            ) : (
              <InfoCardValue>{item.value}</InfoCardValue>
            )}
          </InfoCard>
        </Col>
      ))}
    </Row>
  );
}
