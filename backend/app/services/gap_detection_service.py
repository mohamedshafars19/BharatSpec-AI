import logging
from typing import List, Dict, Any, Tuple
from app.models.schemas import (
    StructuredRequirement,
    SpecificationAuditResult,
    AuditGapItem,
    ReadinessBreakdown
)

logger = logging.getLogger(__name__)

class GapDetectionService:
    """
    Performs deterministic 10-point procurement specification gap analysis
    and calculates an explainable readiness score based on explicit mathematical weights.
    """

    def audit_specification(
        self,
        raw_text: str,
        structured_req: StructuredRequirement,
        matched_standards: List[Any] = None
    ) -> SpecificationAuditResult:
        checklist: List[AuditGapItem] = []
        breakdown: List[ReadinessBreakdown] = []
        critical_missing: List[str] = []
        total_score = 0

        text_lower = raw_text.lower()
        product_lower = structured_req.product.lower()
        reqs_joined = " ".join(structured_req.requirements).lower()
        all_text = f"{text_lower} {reqs_joined} {structured_req.application.lower()} {structured_req.environment.lower()}"

        # 1. Product Definition (Weight: 15)
        has_prod = bool(structured_req.product and structured_req.product != "General Procurement Item")
        has_qty = bool(structured_req.quantity and structured_req.quantity > 0)
        has_cat = bool(structured_req.category and structured_req.category != "General")

        if has_prod and has_qty and has_cat:
            status = "Complete"
            earned = 15
            findings = f"Product unambiguously defined as '{structured_req.product}' with tender volume ({structured_req.quantity} units) and category classification."
            rec = "Product definition meets standard public procurement guidelines."
            clauses = [f"Item Description: Supply, delivery, and testing of {structured_req.product} ({structured_req.quantity} Nos.) as per schedule."]
        elif has_prod:
            status = "Needs Review"
            earned = 10
            findings = f"Product identified as '{structured_req.product}', but volume or exact subtype requires explicit clarification."
            rec = "Specify exact procurement quantity, delivery schedule, and product subtype in BOQ."
            clauses = [f"Quantity Requirement: Bidders shall quote for firm quantity of {structured_req.quantity or '[___]'} units."]
            critical_missing.append("Procurement quantity or exact product subtype")
        else:
            status = "Missing"
            earned = 3
            findings = "Product nomenclature is generic or vague."
            rec = "Clearly name the exact equipment, brand-neutral model class, and category."
            clauses = ["Generic specifications must be revised to identify the specific equipment category."]
            critical_missing.append("Unambiguous product definition")

        checklist.append(AuditGapItem(
            category="Product Definition",
            status=status,
            score=earned,
            max_score=15,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Product Definition",
            percentage=int((earned / 15) * 100),
            weight=15,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 2. Performance Requirements (Weight: 20)
        perf_keywords = ["efficacy", "lumen", "watt", "lm/w", "grade", "fe-500", "53 grade", "kva", "ton", "thrust", "power factor", "thd", "capacity", "rpm", "speed", "flow"]
        has_perf = any(k in all_text for k in perf_keywords) or len(structured_req.performance_specs) > 0
        has_multi_perf = sum(1 for k in perf_keywords if k in all_text) >= 2

        if has_multi_perf:
            status = "Complete"
            earned = 20
            findings = "Primary electrical/mechanical performance parameters and operating ratings are explicitly documented."
            rec = "Ensure operating tolerances (+/- 5%) are stated alongside nominal ratings."
            clauses = ["Performance Criteria: Equipment shall deliver specified output at rated operating voltage/load with maximum 5% tolerance."]
        elif has_perf:
            status = "Needs Review"
            earned = 12
            findings = "Basic performance parameters mentioned, but efficiency benchmarks or tolerance limits are missing."
            rec = "Stipulate mandatory minimum efficiency, power factor, or capacity thresholds."
            clauses = ["Operating Efficiency: Minimum guaranteed efficiency shall not be less than the prescribed baseline at 100% rated load."]
            critical_missing.append("Efficiency or operational tolerance limits")
        else:
            status = "Missing"
            earned = 4
            findings = "No numerical performance thresholds or output metrics found in the specification."
            rec = "Add minimum measurable performance ratings (e.g. system efficacy, rated capacity, power factor)."
            clauses = ["Minimum Performance Threshold: The item must comply with minimum measurable output standards defined in the technical schedule."]
            critical_missing.append("Measurable performance benchmarks")

        checklist.append(AuditGapItem(
            category="Performance Parameters",
            status=status,
            score=earned,
            max_score=20,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Performance",
            percentage=int((earned / 20) * 100),
            weight=20,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 3. Electrical & Mechanical Safety (Weight: 15)
        safety_keywords = ["ip66", "ip65", "surge", "insulation", "earthing", "shock", "grounding", "dielectric", "flame", "fire", "gas lift", "tip-over", "puncture", "impact"]
        has_safety = any(k in all_text for k in safety_keywords) or len(structured_req.safety_specs) > 0

        if has_safety and any(k in all_text for k in ["surge", "ip66", "dielectric", "gas lift"]):
            status = "Complete"
            earned = 15
            findings = "Safety containment, ingress protection, or surge withstand parameters are specified."
            rec = "Verify that protection ratings align with environmental severity (e.g. outdoor lightning exposure)."
            clauses = ["Safety Compliance: Equipment must have built-in protective interlocks and isolation withstand capability."]
        elif has_safety:
            status = "Needs Review"
            earned = 9
            findings = "General safety protection noted, but specific surge rating (kV), insulation resistance (MΩ), or earthing continuity is omitted."
            rec = "Mandate specific electrical dielectric withstand (kV) or mechanical impact endurance levels."
            clauses = ["Surge & Earthing: Built-in surge protection device shall withstand minimum 10 kV impulse without degradation."]
            critical_missing.append("Detailed surge withstand / earthing parameters")
        else:
            status = "Missing"
            earned = 2
            findings = "Safety standards, shock prevention, or surge protection are completely unmentioned."
            rec = "Incorporate mandatory safety clauses covering dielectric strength, earthing continuity, and ingress protection."
            clauses = ["Electrical Safety: Equipment must provide Class I electrical shock protection and insulation resistance > 20 MΩ."]
            critical_missing.append("Mandatory safety & surge protection clause")

        checklist.append(AuditGapItem(
            category="Safety & Protection",
            status=status,
            score=earned,
            max_score=15,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Safety",
            percentage=int((earned / 15) * 100),
            weight=15,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 4. Testing & Verification Protocols (Weight: 15)
        test_keywords = ["test", "nabl", "type test", "routine test", "acceptance test", "photometric", "goniophotometer", "salt spray", "cycle", "drop test"]
        has_test = any(k in all_text for k in test_keywords) or len(structured_req.testing_specs) > 0

        if has_test and any(k in all_text for k in ["nabl", "type test"]):
            status = "Complete"
            earned = 15
            findings = "Laboratory testing protocols and independent accredited (NABL) test report submission are mandated."
            rec = "Ensure sample selection criteria (lot size sampling) are detailed for factory acceptance testing."
            clauses = ["Type Test Certification: Manufacturer must submit valid Type Test reports from a NABL-accredited test lab."]
        elif has_test:
            status = "Needs Review"
            earned = 8
            findings = "Testing is mentioned in passing, but specific laboratory test methods (e.g. IP chamber test, salt spray) and sampling plans are unspecified."
            rec = "Formally cite standard test methods and mandate submission of Type Test certificates prior to supply."
            clauses = ["Testing Protocol: Factory Acceptance Testing (FAT) shall be carried out in accordance with referenced Indian Standards."]
            critical_missing.append("Specific laboratory test protocols & NABL lab report requirement")
        else:
            status = "Missing"
            earned = 0
            findings = "No testing methods, laboratory test certificates, or routine factory inspection protocols are specified."
            rec = "Crucial: Procurement without testing clauses risks non-compliant delivery. Mandate Type Test and Routine Test schedules."
            clauses = [
                "Testing Schedule: Bidders must furnish complete Type Test reports from a NABL-accredited laboratory conducted within the last 3 years.",
                "Acceptance Testing: Purchaser reserves the right to draw random samples for third-party verification."
            ]
            critical_missing.append("Testing & laboratory verification protocol (Crucial)")

        checklist.append(AuditGapItem(
            category="Testing Methods",
            status=status,
            score=earned,
            max_score=15,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Testing",
            percentage=int((earned / 15) * 100),
            weight=15,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 5. Environmental & Climate Conditions (Weight: 10)
        env_keywords = ["outdoor", "indoor", "ambient", "coastal", "humidity", "dust", "temperature", "corrosion", "seismic", "zone"]
        has_env = any(k in all_text for k in env_keywords) or (structured_req.environment and structured_req.environment != "Standard Environment")

        if has_env and any(k in all_text for k in ["outdoor", "coastal", "ambient", "-10", "50 deg"]):
            status = "Complete"
            earned = 10
            findings = f"Operating environment defined ({structured_req.environment})."
            rec = "Confirm operating ambient temperature boundaries (-10°C to +50°C)."
            clauses = [f"Environmental Conditions: Equipment must operate reliably in {structured_req.environment} conditions at 95% relative humidity."]
        elif has_env:
            status = "Needs Review"
            earned = 6
            findings = "General environmental exposure noted, but exact operating temperature ranges and atmospheric salinity need definition."
            rec = "Specify ambient temperature span and humidity tolerance."
            clauses = ["Ambient Rating: Design must withstand ambient temperature ranging from 0°C to +50°C with severe atmospheric dust."]
        else:
            status = "Missing"
            earned = 2
            findings = "Operating site conditions and environmental exposure are undefined."
            rec = "Define whether equipment is indoor, outdoor, coastal, or high-vibration environment."
            clauses = ["Operating Environment: Must be suitable for outdoor field installation with weather and UV exposure."]
            critical_missing.append("Operating environment & temperature rating")

        checklist.append(AuditGapItem(
            category="Environmental Conditions",
            status=status,
            score=earned,
            max_score=10,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Environment",
            percentage=int((earned / 10) * 100),
            weight=10,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 6. Installation & Workmanship Guidelines (Weight: 10)
        inst_keywords = ["mounting", "installation", "pole", "bracket", "spigot", "grommet", "clamp", "weld", "screws", "fasteners", "kd", "allen key"]
        has_inst = any(k in all_text for k in inst_keywords) or len(structured_req.installation_specs) > 0

        if has_inst:
            status = "Complete"
            earned = 10
            findings = "Mechanical mounting, pole clamp dimensions, or field assembly guidelines are specified."
            rec = "Confirm corrosion resistance requirements for external fasteners (SS304/SS316)."
            clauses = ["Mounting Hardware: All external screws and pole mounting clamps must be grade SS304 or SS316 stainless steel."]
        else:
            status = "Missing"
            earned = 2
            findings = "Installation constraints, mounting spigot size, or cabling interface details are absent."
            rec = "Add mounting specifications (e.g. 48-60mm pole spigot, rack depth, or leveling glide provisions)."
            clauses = [
                "Installation Requirements: The luminaire/equipment must be supplied with universal mounting hardware suitable for standard municipal structures."
            ]
            critical_missing.append("Installation & mounting hardware details")

        checklist.append(AuditGapItem(
            category="Installation Requirements",
            status=status,
            score=earned,
            max_score=10,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Installation",
            percentage=int((earned / 10) * 100),
            weight=10,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 7. Mandatory Certification & Conformity (Weight: 10)
        cert_keywords = ["crs", "bee", "star", "isi", "bis", "rohs", "iso", "qco", "compulsory registration", "greenpro"]
        has_cert = any(k in all_text for k in cert_keywords) or len(structured_req.certification_specs) > 0

        if has_cert and any(k in all_text for k in ["crs", "bee", "isi", "qco"]):
            status = "Complete"
            earned = 10
            findings = "Mandatory regulatory certification schemes (CRS/BEE Star Labeling/ISI mark) are cited."
            rec = "Stipulate that registration numbers must be verifiable on the statutory portal."
            clauses = ["Statutory Conformity: Products must bear valid certification marks as mandated by current Quality Control Orders (QCO)."]
        elif has_cert:
            status = "Needs Review"
            earned = 5
            findings = "Quality management (e.g. ISO 9001) mentioned, but statutory Indian regulatory approvals (CRS / BEE / QCO) are unconfirmed."
            rec = "Mandate compliance with applicable Government of India Compulsory Registration Schemes."
            clauses = ["Conformity Scheme: OEM must possess active certification under the relevant statutory quality control framework."]
        else:
            status = "Needs Review"
            earned = 3
            findings = "No conformity registration or statutory certification marks are cited."
            rec = "Verify whether product falls under mandatory Quality Control Orders (QCO) or Compulsory Registration Schemes."
            clauses = [
                "Mandatory Certification: Supplier must furnish valid Bureau product certification license or CRS registration."
            ]
            critical_missing.append("Statutory certification / registration scheme (CRS/BEE/ISI)")

        checklist.append(AuditGapItem(
            category="Certification & Conformity",
            status=status,
            score=earned,
            max_score=10,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Certification",
            percentage=int((earned / 10) * 100),
            weight=10,
            earned=earned,
            status=status
        ))
        total_score += earned

        # 8. Warranty & Service Level Agreement (Weight: 5)
        warr_keywords = ["warranty", "guarantee", "years", "onsite", "replacement", "defect liability", "dlp"]
        has_warr = any(k in all_text for k in warr_keywords) or bool(structured_req.warranty)

        if has_warr:
            status = "Complete"
            earned = 5
            findings = f"Warranty period documented ({structured_req.warranty or 'Prescribed in tender'})."
            rec = "Specify maximum turnaround time for defective unit field replacement (e.g. 48 hours)."
            clauses = ["Warranty Terms: Minimum 5-year comprehensive onsite replacement warranty including drivers and optics."]
        else:
            status = "Missing"
            earned = 0
            findings = "No warranty period, defective liability period, or vendor onsite support terms stated."
            rec = "Define mandatory comprehensive warranty duration (e.g. 3 years or 5 years onsite)."
            clauses = [
                "Comprehensive Warranty: Supplier shall provide minimum 3-year comprehensive warranty covering all parts and labor with 48h SLA."
            ]
            critical_missing.append("Warranty & vendor SLA clause")

        checklist.append(AuditGapItem(
            category="Warranty & Support",
            status=status,
            score=earned,
            max_score=5,
            findings=findings,
            recommendation=rec,
            suggested_clauses=clauses
        ))
        breakdown.append(ReadinessBreakdown(
            category="Warranty",
            percentage=int((earned / 5) * 100),
            weight=5,
            earned=earned,
            status=status
        ))
        total_score += earned

        # Overall Status
        if total_score >= 85 and len(critical_missing) == 0:
            overall_status = "Ready for Tender"
            summary_message = "Specification is well-structured and covers major compliance, safety, and testing requirements."
        elif total_score >= 65:
            overall_status = "Needs Review"
            count = len(critical_missing)
            summary_message = f"{count} key area{'s' if count != 1 else ''} need attention before this specification is finalised."
        else:
            overall_status = "Incomplete"
            summary_message = f"Specification has multiple critical gaps ({len(critical_missing)} missing areas). Review recommended before tender issuance."

        return SpecificationAuditResult(
            readiness_score=total_score,
            overall_status=overall_status,
            checklist=checklist,
            breakdown=breakdown,
            critical_missing=critical_missing,
            summary_message=summary_message
        )

gap_detection_service = GapDetectionService()
