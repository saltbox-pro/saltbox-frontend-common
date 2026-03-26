import { Skeleton } from "antd";

import styles from "./info-drawer-loader.module.css";

export function InfoDrawerLoader() {
  return <Skeleton rootClassName={styles.skeleton} loading active />;
}
