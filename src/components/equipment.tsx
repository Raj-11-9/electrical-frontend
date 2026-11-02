export function Equipment({ kind = 0 }: { kind?: number }) {
  return (
    <div className={"equipment kind-" + kind} aria-hidden="true">
      {kind % 3 === 0 ? (
        <div className="distribution">
          <div className="panel-top" />
          <div className="breakers">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="breaker">
                <i />
                <b />
                <span />
              </div>
            ))}
          </div>
          <div className="panel-bottom">
            <i />
            <i />
          </div>
        </div>
      ) : kind % 3 === 1 ? (
        <div className="box-unit">
          <div />
          <span />
          <i />
          <b />
        </div>
      ) : (
        <div className="lamp">
          <div>
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} />
            ))}
          </div>
          <span />
        </div>
      )}
    </div>
  );
}
