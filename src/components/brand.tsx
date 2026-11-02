import Link from "next/link";
export function Brand() {
  return (
    <Link className="srv-brand" href="/" aria-label="SRV Electricals home">
      <span className="srv-logo-frame">
        <span className="srv-logo-art">
          <img
            src="/srv-logo.png"
            alt="SRV — always improving, since 2000"
            width="600"
            height="416"
          />
          <img
            className="srv-logo-ink"
            src="/srv-logo.png"
            alt=""
            aria-hidden="true"
            width="600"
            height="416"
          />
        </span>
      </span>
      <span className="srv-brand-name">
        SRV ELECTRICALS<small>ELECTRICAL EQUIPMENT</small>
      </span>
    </Link>
  );
}
