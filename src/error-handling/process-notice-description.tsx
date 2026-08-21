import { Flex, Tag } from "antd";

import type { StoredProcessNotice } from "./apply-process-notice-event";

export function ProcessNoticeDescription({ notice }: { notice: StoredProcessNotice }) {
  return (
    <Flex vertical gap={8}>
      {!!notice.description && <span style={{ whiteSpace: "pre-line" }}>{notice.description}</span>}
      {!!notice.chips?.length && (
        <Flex gap={8} wrap="wrap">
          {notice.chips.map((chip) => (
            <Tag key={chip.id} color={chip.color} style={{ margin: 0 }}>
              {chip.count == null ? chip.label : `${chip.label}: ${chip.count}`}
            </Tag>
          ))}
        </Flex>
      )}
      {!!notice.meta && <span style={{ marginTop: 12 }}>{notice.meta}</span>}
    </Flex>
  );
}
