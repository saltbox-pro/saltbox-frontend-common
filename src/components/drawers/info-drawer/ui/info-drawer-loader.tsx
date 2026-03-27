import { Skeleton } from "antd";

import { TransitionLayout } from "saltbox-common/components/transition-layout";

import styles from "./info-drawer-loader.module.css";

interface InfoDrawerLoaderProps {
  loading?: boolean;
}

export function InfoDrawerLoader({ loading }: InfoDrawerLoaderProps) {
  return (
    <TransitionLayout in={!!loading} className={styles.skeleton}>
      <Skeleton active />
    </TransitionLayout>
  );
}
