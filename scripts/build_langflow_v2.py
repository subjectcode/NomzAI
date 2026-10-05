import json
import uuid
import sys
from pathlib import Path

# Add components path
components_dir = Path(__file__).resolve().parent.parent / "langflow" / "components"
sys.path.insert(0, str(components_dir))

from ingredient_normalizer import IngredientNormalizer
from cooking_style_interpreter import CookingStyleInterpreter
from rescue_prompt_builder import RescuePromptBuilder
from recipe_validator import RecipeValidatorFormatter

def create_v2_flow(v1_path=None, comp_dir=None):
    if v1_path is None:
        v1_path = Path(__file__).resolve().parent.parent / "langflow" / "flows" / "find_meals_v1_backup.json"
    if comp_dir is None:
        comp_dir = Path(__file__).resolve().parent.parent / "langflow" / "components"
    v1_path = Path(v1_path)
    comp_dir = Path(comp_dir)

    with open(v1_path, "r", encoding="utf-8") as f:
        v1_flow = json.load(f)

    v1_nodes = {n["data"]["type"]: n for n in v1_flow["data"]["nodes"]}
    chat_input_node = v1_nodes["ChatInput"]
    gemini_node = v1_nodes["ext:google:GoogleGenerativeAIComponent@official"]
    chat_output_node = v1_nodes["ChatOutput"]

    # 1. Ingredient Normalizer Node
    norm_inst = IngredientNormalizer()
    norm_fn = norm_inst.to_frontend_node()
    norm_id = f"IngredientNormalizer-{uuid.uuid4().hex[:5]}"
    norm_node = {
        "id": norm_id,
        "type": "genericNode",
        "position": {"x": 300, "y": 200},
        "data": {
            "node": norm_fn["data"]["node"],
            "type": "IngredientNormalizer",
            "showNode": True,
            "id": norm_id
        }
    }
    # Set code in template
    code_norm = open(comp_dir / "ingredient_normalizer.py", "r", encoding="utf-8").read()
    norm_node["data"]["node"]["template"]["code"]["value"] = code_norm

    # 2. Cooking Style Interpreter Node
    interp_inst = CookingStyleInterpreter()
    interp_fn = interp_inst.to_frontend_node()
    interp_id = f"CookingStyleInterpreter-{uuid.uuid4().hex[:5]}"
    interp_node = {
        "id": interp_id,
        "type": "genericNode",
        "position": {"x": 650, "y": 200},
        "data": {
            "node": interp_fn["data"]["node"],
            "type": "CookingStyleInterpreter",
            "showNode": True,
            "id": interp_id
        }
    }
    code_interp = open(comp_dir / "cooking_style_interpreter.py", "r", encoding="utf-8").read()
    interp_node["data"]["node"]["template"]["code"]["value"] = code_interp

    # 3. Rescue Prompt Builder Node
    prompt_inst = RescuePromptBuilder()
    prompt_fn = prompt_inst.to_frontend_node()
    prompt_id = f"RescuePromptBuilder-{uuid.uuid4().hex[:5]}"
    prompt_node = {
        "id": prompt_id,
        "type": "genericNode",
        "position": {"x": 1000, "y": 200},
        "data": {
            "node": prompt_fn["data"]["node"],
            "type": "RescuePromptBuilder",
            "showNode": True,
            "id": prompt_id
        }
    }
    code_prompt = open(comp_dir / "rescue_prompt_builder.py", "r", encoding="utf-8").read()
    prompt_node["data"]["node"]["template"]["code"]["value"] = code_prompt

    # 4. Recipe Validator & Formatter Node
    val_inst = RecipeValidatorFormatter()
    val_fn = val_inst.to_frontend_node()
    val_id = f"RecipeValidatorFormatter-{uuid.uuid4().hex[:5]}"
    val_node = {
        "id": val_id,
        "type": "genericNode",
        "position": {"x": 1700, "y": 200},
        "data": {
            "node": val_fn["data"]["node"],
            "type": "RecipeValidatorFormatter",
            "showNode": True,
            "id": val_id
        }
    }
    code_val = open(comp_dir / "recipe_validator.py", "r", encoding="utf-8").read()
    val_node["data"]["node"]["template"]["code"]["value"] = code_val

    # Position existing nodes
    chat_input_node["position"] = {"x": -50, "y": 200}
    gemini_node["position"] = {"x": 1350, "y": 200}
    chat_output_node["position"] = {"x": 2050, "y": 200}

    nodes = [
        chat_input_node,
        norm_node,
        interp_node,
        prompt_node,
        gemini_node,
        val_node,
        chat_output_node,
    ]

    # Edges wiring:
    # ChatInput -> IngredientNormalizer (request)
    # IngredientNormalizer -> CookingStyleInterpreter (brief)
    # CookingStyleInterpreter -> RescuePromptBuilder (interpreted_brief)
    # RescuePromptBuilder -> GoogleGenerativeAIComponent (input_value)
    # CookingStyleInterpreter -> RecipeValidatorFormatter (interpreted_brief)
    # GoogleGenerativeAIComponent -> RecipeValidatorFormatter (llm_output)
    # RecipeValidatorFormatter -> ChatOutput (input_value)

    def make_edge(src_id, src_handle, tgt_id, tgt_handle):
        src_str = json.dumps(src_handle)
        tgt_str = json.dumps(tgt_handle)
        return {
            "source": src_id,
            "sourceHandle": src_str,
            "target": tgt_id,
            "targetHandle": tgt_str,
            "data": {
                "sourceHandle": src_handle,
                "targetHandle": tgt_handle
            },
            "id": f"xy-edge__{src_id}{src_str}-{tgt_id}{tgt_str}",
            "animated": False,
            "className": "",
            "selected": False
        }

    edges = [
        make_edge(
            chat_input_node["id"],
            {"dataType": "ChatInput", "id": chat_input_node["id"], "name": "message", "output_types": ["Message"]},
            norm_id,
            {"fieldName": "request", "id": norm_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            norm_id,
            {"dataType": "IngredientNormalizer", "id": norm_id, "name": "brief", "output_types": ["Message"]},
            interp_id,
            {"fieldName": "brief", "id": interp_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            interp_id,
            {"dataType": "CookingStyleInterpreter", "id": interp_id, "name": "interpreted", "output_types": ["Message"]},
            prompt_id,
            {"fieldName": "interpreted_brief", "id": prompt_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            prompt_id,
            {"dataType": "RescuePromptBuilder", "id": prompt_id, "name": "prompt", "output_types": ["Message"]},
            gemini_node["id"],
            {"fieldName": "input_value", "id": gemini_node["id"], "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            interp_id,
            {"dataType": "CookingStyleInterpreter", "id": interp_id, "name": "interpreted", "output_types": ["Message"]},
            val_id,
            {"fieldName": "interpreted_brief", "id": val_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            gemini_node["id"],
            {"dataType": "ext:google:GoogleGenerativeAIComponent@official", "id": gemini_node["id"], "name": "text_output", "output_types": ["Message"]},
            val_id,
            {"fieldName": "llm_output", "id": val_id, "inputTypes": ["Message"], "type": "str"}
        ),
        make_edge(
            val_id,
            {"dataType": "RecipeValidatorFormatter", "id": val_id, "name": "formatted_json", "output_types": ["Message"]},
            chat_output_node["id"],
            {"fieldName": "input_value", "id": chat_output_node["id"], "inputTypes": ["Data", "JSON", "DataFrame", "Table", "Message"], "type": "other"}
        )
    ]

    new_flow_id = str(uuid.uuid4())
    flow_v2 = {
        "name": "find_meals_v2",
        "description": "Nomz AI Culinary Orchestration Layer V2: Ingredient Normalization, Food Rescue Reasoning, Cooking Style Enforcement, Guided Technical Steps, and Strict Recipe Validation.",
        "icon": "chef-hat",
        "icon_bg_color": "#FF6B00",
        "gradient": "",
        "data": {
            "nodes": nodes,
            "edges": edges,
            "viewport": {"x": 100, "y": 100, "zoom": 0.8}
        },
        "is_component": False,
        "mcp_enabled": True,
        "action_name": "find_meals_v2",
        "action_description": "Nomz AI Culinary Orchestration V2 for recipe recommendation and food rescue",
        "endpoint_name": "find_meals_v2",
        "tags": ["nomz", "orchestration", "v2", "culinary", "food-rescue"],
    }
    return flow_v2

if __name__ == "__main__":
    flow = create_v2_flow()
    out_path = Path(__file__).resolve().parent.parent / "langflow" / "flows" / "find_meals_v2.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(flow, f, indent=2, ensure_ascii=False)
    print(f"Generated flow v2 at {out_path}")
