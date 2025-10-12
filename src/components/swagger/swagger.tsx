"use client";

import { useEffect } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-custom.css";

interface SwaggerProps {
  spec: any;
}

export default function Swagger({ spec }: SwaggerProps) {
  useEffect(() => {
    // Suppress UNSAFE_componentWillReceiveProps warnings from swagger-ui-react
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("UNSAFE_componentWillReceiveProps")
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <div className="swagger-ui-wrapper">
      <SwaggerUI spec={spec} />
    </div>
  );
}
