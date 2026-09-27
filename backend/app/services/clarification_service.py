import logging
from typing import List, Optional
from app.models.schemas import (
    StructuredRequirement,
    ClarificationQuestion,
    ClarificationOption,
    ClarificationAnswer
)

logger = logging.getLogger(__name__)

class ClarificationService:
    """
    Generates intelligent clarifying questions when requirements lack specific operational parameters.
    """

    def generate_questions(
        self,
        raw_text: str,
        structured_req: StructuredRequirement
    ) -> List[ClarificationQuestion]:
        questions: List[ClarificationQuestion] = []
        text_lower = raw_text.lower()
        cat_lower = structured_req.category.lower()

        # Question 1: Location & Installation Environment
        if not any(k in text_lower for k in ["coastal", "indoor", "expressway", "corrosive", "marine"]):
            questions.append(ClarificationQuestion(
                id="q_install_location",
                question="Where will the procured items be installed or deployed?",
                context_field="environment",
                help_text="Installation environment impacts ingress protection (IP), corrosion endurance, and enclosure alloy grade.",
                options=[
                    ClarificationOption(id="opt_outdoor_urban", label="Outdoor (Urban / Municipal Road)", value="Outdoor municipal roadways, weather-exposed"),
                    ClarificationOption(id="opt_outdoor_coastal", label="Coastal / Marine Atmosphere", value="Coastal marine environment requiring SS316 fasteners and 1000h salt spray test"),
                    ClarificationOption(id="opt_indoor", label="Indoor Administrative Facility", value="Indoor office / administrative facility"),
                    ClarificationOption(id="opt_industrial", label="Heavy Industrial / Factory Zone", value="Industrial heavy dust and chemical atmosphere"),
                    ClarificationOption(id="opt_not_decided", label="Standard / Not yet decided", value="Standard operational environment")
                ]
            ))

        # Question 2: Testing & Lab Verification Rigor
        if not any(k in text_lower for k in ["nabl", "type test", "routine test"]):
            questions.append(ClarificationQuestion(
                id="q_testing_rigor",
                question="What level of testing verification should be mandatory for bid acceptance?",
                context_field="testing_specs",
                help_text="Procurement tenders typically mandate Type Test reports from NABL-accredited test laboratories.",
                options=[
                    ClarificationOption(id="opt_nabl_type", label="Mandatory NABL Laboratory Type Test Reports", value="Submission of complete Type Test certificate from NABL-accredited laboratory"),
                    ClarificationOption(id="opt_factory_witness", label="Factory Acceptance Testing (FAT) with Purchaser Witness", value="Factory acceptance inspection with random lot sample verification"),
                    ClarificationOption(id="opt_oem_routine", label="OEM Self-Declaration & Routine Test Certificate", value="Manufacturer routine test certificate accompanying supply batch"),
                    ClarificationOption(id="opt_not_decided", label="Standard Testing Schedule", value="Standard inspection protocol as per Indian Standards")
                ]
            ))

        # Question 3: Domain-specific question
        if "light" in cat_lower or "lighting" in cat_lower:
            if not any(k in text_lower for k in ["surge", "10kv", "5kv"]):
                questions.append(ClarificationQuestion(
                    id="q_surge_level",
                    question="What electrical surge protection withstand level is required?",
                    context_field="performance_specs",
                    help_text="Outdoor municipal fixtures require robust surge endurance to survive grid fluctuations and lightning impulses.",
                    options=[
                        ClarificationOption(id="opt_surge_10kv", label="10 kV / 5 kA Built-in Surge Protection (Recommended)", value="Built-in 10 kV / 5 kA Surge Protection Device (SPD)"),
                        ClarificationOption(id="opt_surge_4kv", label="4 kV to 6 kV Standard Protection", value="Internal 4 kV to 6 kV surge withstand capability"),
                        ClarificationOption(id="opt_external_spd", label="Dual Protection (Internal + External Pole SPD)", value="10 kV internal SPD with additional 10 kV external junction box SPD")
                    ]
                ))
        elif "furniture" in cat_lower:
            if not any(k in text_lower for k in ["gas lift", "class 4", "bifma"]):
                questions.append(ClarificationQuestion(
                    id="q_chair_durability",
                    question="What durability tier is required for the seating mechanism?",
                    context_field="safety_specs",
                    help_text="Class-4 pneumatic gas-lift cylinders are mandatory for government secretariats and public offices.",
                    options=[
                        ClarificationOption(id="opt_class_4", label="Class-4 Gas Lift Cylinder (136 kg capacity, 100k cycles)", value="Class-4 heavy-duty pneumatic gas lift certified for 136 kg load"),
                        ClarificationOption(id="opt_class_3", label="Class-3 Gas Lift Cylinder (Standard commercial)", value="Class-3 pneumatic cylinder for general office task seating"),
                        ClarificationOption(id="opt_not_decided", label="Standard Commercial Grade", value="Standard commercial durability rating")
                    ]
                ))
        elif "construction" in cat_lower:
            if not any(k in text_lower for k in ["fe-500", "fe-550", "seismic", "ductility"]):
                questions.append(ClarificationQuestion(
                    id="q_steel_grade",
                    question="Which ductility grade is required for structural steel reinforcement?",
                    context_field="performance_specs",
                    help_text="Grade 'D' (Fe-500D) provides superior elongation and energy absorption for earthquake zones.",
                    options=[
                        ClarificationOption(id="opt_fe_500d", label="Fe-500D High Ductility (Seismic Zones III/IV/V)", value="Fe-500D grade rebar with minimum 16% elongation and UTS/YS ratio >= 1.10"),
                        ClarificationOption(id="opt_fe_550d", label="Fe-550D High Strength & Ductility", value="Fe-550D grade steel for heavy infrastructure bridges and flyovers"),
                        ClarificationOption(id="opt_standard_500", label="Standard Fe-500 Grade", value="Standard Fe-500 rebar specification")
                    ]
                ))

        return questions[:3]

    def apply_answers(
        self,
        structured_req: StructuredRequirement,
        answers: List[ClarificationAnswer]
    ) -> StructuredRequirement:
        updated = structured_req.model_copy()

        for ans in answers:
            val = ans.custom_value or ans.selected_option
            qid = ans.question_id

            if qid == "q_install_location":
                updated.environment = val
                updated.requirements.append(f"Environment: {val}")
            elif qid == "q_testing_rigor":
                updated.testing_specs.append(val)
                updated.requirements.append(f"Testing: {val}")
            elif qid in ("q_surge_level", "q_steel_grade"):
                updated.performance_specs.append(val)
                updated.requirements.append(f"Performance: {val}")
            elif qid == "q_chair_durability":
                updated.safety_specs.append(val)
                updated.requirements.append(f"Safety: {val}")

        return updated

clarification_service = ClarificationService()
