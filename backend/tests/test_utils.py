from datetime import timedelta

from django.test import SimpleTestCase
from django.utils import timezone

from apps.common.models import initials_for
from apps.common.utils import deterministic_uuid, humanize_delta, parse_duration_to_minutes


class HumanizeDeltaTests(SimpleTestCase):
    def setUp(self):
        self.now = timezone.now()

    def test_recent_activity_reads_as_just_now(self):
        self.assertEqual(humanize_delta(self.now - timedelta(seconds=20)), "Just now")

    def test_minutes_hours_and_days(self):
        self.assertEqual(humanize_delta(self.now - timedelta(minutes=20)), "20 mins ago")
        self.assertEqual(humanize_delta(self.now - timedelta(minutes=1)), "1 min ago")
        self.assertEqual(humanize_delta(self.now - timedelta(hours=2)), "2 hours ago")
        self.assertEqual(humanize_delta(self.now - timedelta(days=1)), "Yesterday")
        self.assertEqual(humanize_delta(self.now - timedelta(days=4)), "4 days ago")

    def test_future_and_empty_values(self):
        self.assertEqual(humanize_delta(None), "")
        self.assertEqual(humanize_delta(self.now + timedelta(hours=1)), "Just now")


class DurationTests(SimpleTestCase):
    def test_parses_the_duration_strings_used_in_the_catalogue(self):
        self.assertEqual(parse_duration_to_minutes("90m"), 90)
        self.assertEqual(parse_duration_to_minutes("18h 30m"), 1110)
        self.assertEqual(parse_duration_to_minutes("1h"), 60)
        self.assertEqual(parse_duration_to_minutes(""), 0)
        self.assertEqual(parse_duration_to_minutes("n/a"), 0)


class InitialsTests(SimpleTestCase):
    def test_initials_from_names(self):
        self.assertEqual(initials_for("Dr. Amine Haddad"), "AH")
        self.assertEqual(initials_for("Aya Zmt"), "AZ")
        self.assertEqual(initials_for("Madonna"), "MA")
        self.assertEqual(initials_for(""), "?")


class DeterministicUuidTests(SimpleTestCase):
    def test_same_key_yields_the_same_id(self):
        self.assertEqual(deterministic_uuid("course-1"), deterministic_uuid("course-1"))
        self.assertNotEqual(deterministic_uuid("course-1"), deterministic_uuid("course-2"))
