import React, { useState, useEffect } from "react";
import { SlsPreview } from "./SlsPreview";
import type { FormSchema } from "../../types";
import { parseSchemaFromSls, extractSlsBody, getEmptySchema, getEmptySlsBody } from "../../utils/slsParser";

export interface SlsPreviewWrapperProps {
  /**
   * Complete SLS content with embedded schema
   */
  sls?: string;
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * SlsPreviewWrapper - wrapper component that parses SLS and passes data to SlsPreview
 *
 * This component handles SLS parsing and provides a simpler interface for stories
 * when you have the complete SLS string.
 *
 * @example
 * ```tsx
 * <SlsPreviewWrapper sls={exampleFileManagementSls} />
 * ```
 */
export const SlsPreviewWrapper: React.FC<SlsPreviewWrapperProps> = ({
  sls,
  className,
}) => {
  const [schema, setSchema] = useState<FormSchema>(getEmptySchema());
  const [slsBody, setSlsBody] = useState<string>(getEmptySlsBody());

  useEffect(() => {
    if (!sls) {
      setSchema(getEmptySchema());
      setSlsBody(getEmptySlsBody());
      return;
    }

    try {
      const parsedSchema = parseSchemaFromSls(sls);
      const parsedBody = extractSlsBody(sls);
      setSchema(parsedSchema);
      setSlsBody(parsedBody);
    } catch (err) {
      console.error("Error parsing SLS in preview:", err);
      setSchema(getEmptySchema());
      setSlsBody(getEmptySlsBody());
    }
  }, [sls]);

  return <SlsPreview schema={schema} slsBody={slsBody} className={className} />;
};
