import Icon from "./Icon";
import "./FlowStepper.css";

type FlowStepperProps = {
  currentStep: number;
  totalSteps: number;
};

const FlowStepper = ({ currentStep, totalSteps }: FlowStepperProps) => (
  <div aria-label={`Krok ${currentStep} z ${totalSteps}`} className="ds-flow-stepper">
    {Array.from({ length: totalSteps }, (_, index) => {
      const step = index + 1;
      const completed = currentStep > step;
      const active = currentStep >= step;

      return (
        <span className="ds-flow-stepper__part" key={step}>
          <span className="ds-flow-stepper__dot" data-active={active ? "true" : "false"}>
            {completed ? <Icon name="check" size={12} /> : step}
          </span>
          {step < totalSteps ? (
            <span className="ds-flow-stepper__line" data-active={completed ? "true" : "false"} />
          ) : null}
        </span>
      );
    })}
  </div>
);

export default FlowStepper;
