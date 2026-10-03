import pytest


class NavigationStackManager:
    """Python reference implementation of Nomz React Native navigation history stack logic."""

    def __init__(self, root_tab: str = "beranda"):
        self.root_tab = root_tab
        self.active_tab = root_tab
        self.current_screen = root_tab
        self.screen_params = {}
        self.history = []

    def push(self, screen: str, params=None, tab: str = None):
        target_tab = tab or self.active_tab
        # Don't push duplicate if screen and params are identical to top
        if not (self.current_screen == screen and self.active_tab == target_tab and self.screen_params == (params or {})):
            self.history.append({
                "screen": self.current_screen,
                "tab": self.active_tab,
                "params": self.screen_params,
            })
        self.current_screen = screen
        self.active_tab = target_tab
        self.screen_params = params or {}

    def handle_back_press(self) -> bool:
        """Simulates Android hardwareBackPress event listener.

        Returns True if event was handled (consumed by pop), False if at root (exits app).
        """
        if self.history:
            prev = self.history.pop()
            self.current_screen = prev["screen"]
            self.active_tab = prev["tab"]
            self.screen_params = prev.get("params", {})
            return True

        if self.current_screen != self.root_tab:
            self.current_screen = self.root_tab
            self.active_tab = self.root_tab
            self.screen_params = {}
            return True

        # At root screen: let Android handle back (exit app)
        return False


def test_navigation_stack_push_and_back():
    """Verify nested navigation pops in reverse order: Detail -> GuidedCooking -> Detail -> Home."""
    nav = NavigationStackManager(root_tab="beranda")
    assert nav.current_screen == "beranda"

    # User opens Recipe Detail
    nav.push("detail_resep", {"recipe_id": "123"})
    assert nav.current_screen == "detail_resep"
    assert len(nav.history) == 1

    # User opens Guided Cooking from Recipe Detail
    nav.push("guided_cooking", {"recipe_id": "123", "step": 1})
    assert nav.current_screen == "guided_cooking"
    assert len(nav.history) == 2

    # Press Android Back: Guided Cooking -> Recipe Detail
    handled = nav.handle_back_press()
    assert handled is True
    assert nav.current_screen == "detail_resep"
    assert len(nav.history) == 1

    # Press Android Back again: Recipe Detail -> Home (Beranda)
    handled = nav.handle_back_press()
    assert handled is True
    assert nav.current_screen == "beranda"
    assert len(nav.history) == 0

    # Press Android Back at Home: should return False to exit app
    handled = nav.handle_back_press()
    assert handled is False
    assert nav.current_screen == "beranda"


def test_scan_and_profile_navigation_flows():
    """Verify Scan confirmation -> Scan and Profile Settings -> Profile back flows."""
    nav = NavigationStackManager(root_tab="beranda")

    # Flow 1: Scan camera -> Scan confirmation -> Back to camera
    nav.push("scan", {}, tab="scan")
    assert nav.current_screen == "scan"

    nav.push("scan_confirm", {"items": ["telur", "tomat"]}, tab="scan")
    assert nav.current_screen == "scan_confirm"

    # Press Back returns to scan camera
    handled = nav.handle_back_press()
    assert handled is True
    assert nav.current_screen == "scan"

    # Flow 2: Explore list -> Explore detail -> Back to list
    nav.push("explore", {}, tab="explore")
    nav.push("detail_resep", {"recipe_id": "sop_buntut"}, tab="explore")
    assert nav.current_screen == "detail_resep"

    handled = nav.handle_back_press()
    assert handled is True
    assert nav.current_screen == "explore"


def test_auth_register_screen_back_press_returns_to_login():
    """Verify that pressing Android hardware back on Register screen returns to Login rather than exiting app."""
    class AuthNavigationManager:
        def __init__(self):
            self.is_authenticated = False
            self.auth_sub_screen = "login"

        def open_register(self):
            self.auth_sub_screen = "register"

        def handle_back_press(self) -> bool:
            if not self.is_authenticated:
                if self.auth_sub_screen == "register":
                    self.auth_sub_screen = "login"
                    return True
                return False
            return False

    auth_nav = AuthNavigationManager()
    assert auth_nav.auth_sub_screen == "login"

    # User taps "Daftar"
    auth_nav.open_register()
    assert auth_nav.auth_sub_screen == "register"

    # User presses Android hardware Back
    handled = auth_nav.handle_back_press()
    assert handled is True
    assert auth_nav.auth_sub_screen == "login"

    # User presses Android hardware Back at Login (root auth screen) -> allows exit
    handled = auth_nav.handle_back_press()
    assert handled is False
    assert auth_nav.auth_sub_screen == "login"
