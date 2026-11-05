import styled from "styled-components";

interface LoadingBarProps {
  progress?: number; // 0–100
  width?: number;
}

export const FlowSpaceLoadingBar = ({
  progress = 0,
  width = 360,
}: LoadingBarProps) => {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <StyledWrapper $width={width}>
      <div className="loading-bar">
        <div
          className="fill"
          style={{
            width: `${value}%`,
          }}
        >
          <div className="shine" />
        </div>
      </div>

      <div className="info">
        <span>LOADING</span>
        <span>{Math.round(value)} %</span>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ $width: number }>`
  width: ${({ $width }) => `${$width}px`};
  max-width: calc(94vw - 110px);
  min-width: 0;
  box-sizing: border-box;
  font-family: "Courier New", monospace;

  image-rendering: pixelated;

  .loading-bar {
    position: relative;

    width: 100%;
    height: 24px;

    overflow: hidden;

    background: #111a1b;

    border: 3px solid #080d0e;

    box-shadow:
      inset 3px 3px 0 #2b3939,
      inset -3px -3px 0 #080b0c,
      4px 4px 0 rgba(0, 0, 0, 0.25);
  }

  /* Filled section */

  .fill {
    position: absolute;

    left: 0;
    top: 0;
    bottom: 0;

    min-width: 0;

    background: linear-gradient(180deg, #8be0bd 0%, #55bd98 48%, #359276 100%);

    transition: width 250ms cubic-bezier(0.2, 1.3, 0.4, 1);

    overflow: hidden;
  }

  /* Bright pixel edge */

  .fill::after {
    content: "";

    position: absolute;

    right: 0;
    top: 0;

    width: 4px;
    height: 100%;

    background: #d4ffe9;

    box-shadow: 0 0 7px #a6f5d2;
  }

  /* Top shine */

  .shine {
    position: absolute;

    left: 0;
    right: 0;
    top: 2px;

    height: 3px;

    background: rgba(235, 255, 246, 0.4);
  }

  /* Pixel divisions */

  .segments span {
    width: 2px;
    height: 100%;

    background: rgba(10, 25, 24, 0.35);
  }

  .info {
    display: flex;

    justify-content: space-between;

    margin-top: 7px;

    padding: 0 2px;

    font-size: 9px;
    font-weight: bold;

    letter-spacing: 2px;

    color: #9bd2bd;
  }

  .info span:last-child {
    color: #f1dca8;
  }
`;
