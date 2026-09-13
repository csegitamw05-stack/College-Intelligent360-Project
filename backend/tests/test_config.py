from app.core.config import settings


def test_settings_loaded():
    assert settings.PROJECT_NAME == "Campus Intelligence 360"
    assert settings.API_V1_STR == "/api/v1"
    assert isinstance(settings.CORS_ORIGINS, list)
    assert len(settings.CORS_ORIGINS) > 0


def test_database_url_generation():
    db_url = settings.get_database_url()
    assert db_url is not None
    assert len(db_url) > 0
