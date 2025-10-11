"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-custom.css";

interface SwaggerProps {
  spec: any;
}

export default function Swagger({ spec }: SwaggerProps) {
  return (
    <div className="swagger-ui-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  );
}
