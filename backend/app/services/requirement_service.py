import re
import logging
from typing import Dict, Any, Optional
from app.models.schemas import StructuredRequirement
from app.services.gemini_service import gemini_service
from app.core.config import settings

logger = logging.getLogger(__name__)

class RequirementService:
    async def parse_requirement(
        self,
        raw_text: str,
        hint_category: Optional[str] = None,
        hint_application: Optional[str] = None,
        hint_specs: Optional[str] = None,
        hint_quantity: Optional[int] = None
    ) -> StructuredRequirement:
        """
        Extracts structured requirements via Gemini AI when active,
        or deterministic intelligent parser in Demo Mode / offline.
        """
        text = raw_text.strip()
        
        # 1. Try Gemini if configured
        if gemini_service.is_configured():
            try:
                gemini_data = await gemini_service.extract_requirement(text)
                if gemini_data:
                    # Validate and override hints if provided
                    if hint_quantity and not gemini_data.get("quantity"):
                        gemini_data["quantity"] = hint_quantity
                    if hint_category and hint_category != "All":
                        gemini_data["category"] = hint_category
                    if hint_application:
                        gemini_data["application"] = f"{gemini_data.get('application', '')} ({hint_application})"
                    if hint_specs:
                        reqs = gemini_data.get("requirements", [])
                        reqs.append(hint_specs)
                        gemini_data["requirements"] = reqs
                        
                    return StructuredRequirement(
                        product=gemini_data.get("product", "Procured Item"),
                        category=gemini_data.get("category", "General"),
                        application=gemini_data.get("application", "Standard Operational Use"),
                        environment=gemini_data.get("environment", "Standard Environment"),
                        quantity=gemini_data.get("quantity"),
                        requirements=gemini_data.get("requirements", []),
                        keywords=gemini_data.get("keywords", [])
                    )
            except Exception as e:
                logger.warning(f"Error during Gemini requirement parsing: {e}. Fallback to rule engine.")

        # 2. Deterministic Rule-Based Semantic Extraction (Demo / Fallback Mode)
        return self._deterministic_parse(text, hint_category, hint_application, hint_specs, hint_quantity)

    def _deterministic_parse(
        self,
        text: str,
        hint_category: Optional[str] = None,
        hint_application: Optional[str] = None,
        hint_specs: Optional[str] = None,
        hint_quantity: Optional[int] = None
    ) -> StructuredRequirement:
        text_lower = text.lower()
        
        # Detect Quantity
        quantity = hint_quantity
        if not quantity:
            qty_match = re.search(r'\b(\d{1,7})\s*(?:units?|nos?|pieces?|sets?|lights?|chairs?|meters?|bags?|pcs?|kms?|tons?)?\b', text_lower)
            if qty_match:
                try:
                    quantity = int(qty_match.group(1))
                except ValueError:
                    quantity = None

        # Product & Category Classification
        product = "General Procurement Item"
        category = hint_category if (hint_category and hint_category != "All") else "General"
        application = hint_application or "General Deployment"
        environment = "Standard Environment"
        detected_reqs = []
        keywords = []

        if any(w in text_lower for w in ["led", "street light", "luminaire", "lamp", "lighting", "floodlight", "pole light"]):
            product = "LED Street Lighting Luminaires"
            category = "Lighting"
            application = hint_application or "Municipal roads, urban expressways, and roadway illumination"
            environment = "Outdoor municipal roadway with weather and dust exposure"
            detected_reqs.extend(["High luminous efficacy (>= 120 lm/W)", "IP66 Ingress Protection", "Built-in Surge Protection (10 kV)"])
            keywords.extend(["led street light", "luminaire", "municipal road", "ip66", "energy efficiency", "outdoor lighting"])

        elif any(w in text_lower for w in ["chair", "seating", "furniture", "desk", "workstation", "almirah", "cupboard", "cabinet", "table"]):
            category = "Office Furniture"
            if any(w in text_lower for w in ["chair", "seating", "revolving", "swivel"]):
                product = "Ergonomic Swivel Office Seating"
                application = hint_application or "Administrative offices, secretariats, and institutional desks"
                environment = "Indoor commercial air-conditioned office environment"
                detected_reqs.extend(["Class-4 gas-lift cylinder", "Synchronous tilt mechanism", "Breathable mesh backrest & lumbar support"])
                keywords.extend(["office chair", "ergonomic chair", "swivel chair", "gas lift", "institutional furniture"])
            elif any(w in text_lower for w in ["workstation", "desk", "table"]):
                product = "Modular Office Workstations"
                application = hint_application or "Open-plan office floor layout with wire management"
                environment = "Indoor administrative office"
                detected_reqs.extend(["25mm pre-laminated board", "Integrated electrical/data raceway", "Powder-coated steel understructure"])
                keywords.extend(["modular workstation", "office desk", "raceway", "particle board"])
            else:
                product = "Steel Storage Almirahs / Cabinets"
                application = hint_application or "Record room and departmental document storage"
                environment = "Indoor office storage room"
                detected_reqs.extend(["0.8mm - 1.0mm CRCA steel sheet", "3-way locking mechanism", "Anti-rust powder coat"])
                keywords.extend(["steel almirah", "storage cabinet", "crca steel", "filing cabinet"])

        elif any(w in text_lower for w in ["tmt", "steel", "rebar", "reinforcement", "cement", "concrete", "opc", "ppc"]):
            category = "Construction Materials"
            if any(w in text_lower for w in ["tmt", "rebar", "reinforcement", "fe-500", "fe 500", "fe 550"]):
                product = "Thermo-Mechanically Treated (TMT) Steel Reinforcement Bars"
                application = hint_application or "Reinforced cement concrete (RCC) civil foundations, bridges, and infrastructure"
                environment = "Civil construction site with seismic consideration (Zone III/IV/V)"
                detected_reqs.extend(["Fe-500D / Fe-550D high ductility grade", "UTS/YS ratio >= 1.10", "Elongation at fracture >= 16%"])
                keywords.extend(["tmt bars", "reinforcement steel", "rebar", "fe 500d", "civil construction"])
            else:
                product = "Ordinary Portland Cement (OPC 53/43 Grade)"
                application = hint_application or "Heavy civil structures, concrete pavements, and load-bearing columns"
                environment = "Civil construction works"
                detected_reqs.extend(["28-day compressive strength >= 53 MPa", "Initial setting >= 30 min", "Low chloride content"])
                keywords.extend(["cement", "opc 53", "concrete", "compressive strength"])

        elif any(w in text_lower for w in ["helmet", "shoes", "boot", "footwear", "hard hat", "ppe", "safety glove", "protective"]):
            category = "Safety Equipment"
            if any(w in text_lower for w in ["helmet", "hard hat", "head"]):
                product = "Industrial Safety Helmets (Hard Hats)"
                application = hint_application or "Infrastructure project sites, construction supervision, and plant safety"
                environment = "High-impact outdoor hazardous construction environment"
                detected_reqs.extend(["High-density HDPE/ABS outer shell", "Transmitted shock force <= 5.0 kN", "Electrical insulation up to 440V AC"])
                keywords.extend(["safety helmet", "hard hat", "ppe", "head protection", "construction safety"])
            else:
                product = "Industrial Safety Footwear with Protective Toecap"
                application = hint_application or "Field workers, industrial workshops, and warehouse safety"
                environment = "Shop floor and site conditions with slip, drop, and puncture hazards"
                detected_reqs.extend(["200 Joules impact steel/composite toecap", "Anti-puncture steel midsole (>= 1100 N)", "SRC slip-resistant outsole"])
                keywords.extend(["safety footwear", "safety shoes", "steel toecap", "ppe", "puncture resistance"])

        elif any(w in text_lower for w in ["transformer", "cable", "wire", "switchgear", "driver", "power cable", "armoured"]):
            category = "Electrical Equipment"
            if any(w in text_lower for w in ["transformer", "11kv", "substation"]):
                product = "Oil-Immersed Distribution Transformers (11kV)"
                application = hint_application or "Municipal power distribution substation and infrastructure pumping grid"
                environment = "Outdoor substation plinth installation"
                detected_reqs.extend(["BEE Star Rating Level 2 energy efficiency", "Electrolytic copper winding", "Dielectric BDV >= 60 kV"])
                keywords.extend(["distribution transformer", "11kv transformer", "energy efficiency", "substation"])
            elif any(w in text_lower for w in ["driver", "controlgear"]):
                product = "Electronic Controlgear (Drivers) for LED Lighting"
                application = hint_application or "Constant current power supplies for roadway luminaires"
                environment = "Sealed internal luminaire driver chamber"
                detected_reqs.extend(["440V AC high voltage withstand for 2 hours", "Surge withstand up to 10 kV", "Thermal foldback protection"])
                keywords.extend(["led driver", "controlgear", "power supply", "surge protection"])
            else:
                product = "XLPE Insulated Armoured Electric Power Cables (1.1 kV)"
                application = hint_application or "Underground primary distribution feeder and main substation routing"
                environment = "Underground buried trench or cable tray"
                detected_reqs.extend(["1.1 kV working voltage rating", "Galvanized steel wire/strip armouring", "Flame Retardant Low Smoke (FRLS) outer sheath"])
                keywords.extend(["armoured cable", "xlpe cable", "power cable", "1.1 kv", "underground cable"])

        elif any(w in text_lower for w in ["computer", "desktop", "pc", "laptop", "server", "ups", "inverter"]):
            category = "IT & Office Hardware"
            if any(w in text_lower for w in ["ups", "uninterruptible", "battery backup"]):
                product = "Online Uninterruptible Power Supply (UPS) System"
                application = hint_application or "Data center servers, critical IT equipment, and administrative network racks"
                environment = "Indoor IT server room / telecom facility"
                detected_reqs.extend(["True online double-conversion (zero transfer time)", "Pure sine wave with THDv <= 2%", "IGBT active power factor correction >= 0.99"])
                keywords.extend(["ups", "online ups", "uninterruptible power supply", "battery backup", "pure sine wave"])
            else:
                product = "Enterprise Desktop Personal Computers"
                application = hint_application or "Government offices, departmental administration, and e-governance workstations"
                environment = "Indoor departmental office workstation"
                detected_reqs.extend(["Latest multi-core processor (x86 64-bit)", "16 GB RAM with 512 GB PCIe NVMe SSD", "Hardware TPM 2.0 security chip", "Energy Star 8.0 certified"])
                keywords.extend(["desktop computer", "personal computer", "tpm 2.0", "office it", "government procurement"])

        elif any(w in text_lower for w in ["pipe", "water", "hdpe", "drinking water", "pipeline"]):
            product = "High-Density Polyethylene (HDPE) Water Supply Pipes"
            category = "Water Supply & Sanitation"
            application = hint_application or "Potable drinking water supply network and municipal distribution mains"
            environment = "Underground water conveyance trench"
            detected_reqs.extend(["100% virgin PE-100 grade polymer resin", "Pressure ratings PN 6 to PN 16", "Continuous blue co-extruded potable identification stripes"])
            keywords.extend(["hdpe pipe", "potable water", "water supply", "drinking water", "pe 100"])

        # Add hint specs if provided
        if hint_specs:
            detected_reqs.append(hint_specs)

        # Fallback keyword extraction if empty
        if not keywords:
            tokens = [w for w in text_lower.split() if len(w) > 3 and w not in ["need", "procure", "want", "require", "specification", "order", "supply"]]
            keywords = tokens[:8]

        return StructuredRequirement(
            product=product,
            category=category,
            application=application,
            environment=environment,
            quantity=quantity,
            requirements=detected_reqs,
            keywords=keywords
        )

requirement_service = RequirementService()
