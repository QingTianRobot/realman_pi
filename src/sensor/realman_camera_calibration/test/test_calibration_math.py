import numpy as np
import cv2
from pathlib import Path
import yaml

from realman_camera_calibration.calibration_math import (
    BoardObservation,
    annotate_charuco,
    detect_charuco,
    dictionary_from_name,
    make_charuco_board,
    relative_pose_from_board_poses,
    solve_hand_eye,
    transform_matrix,
)
from realman_camera_calibration.layout_update import update_layout_file


def test_charuco_preview_contains_detection_overlay():
    image = np.zeros((120, 160, 3), dtype=np.uint8)
    observation = BoardObservation(
        corners=np.asarray([[[40.0, 40.0]], [[80.0, 40.0]], [[40.0, 80.0]]], dtype=np.float32),
        ids=np.asarray([[0], [1], [2]], dtype=np.int32),
        camera_matrix=np.asarray([[120.0, 0.0, 80.0], [0.0, 120.0, 60.0], [0.0, 0.0, 1.0]]),
        distortion=np.zeros(5),
        image_size=(160, 120),
        target_to_camera=np.eye(4),
        reprojection_error_px=0.42,
    )
    preview = annotate_charuco(image, observation, 0.03)
    assert preview.shape == image.shape
    assert np.count_nonzero(preview != image) > 0
    assert cv2.mean(preview[:34])[0] > 0.0
def test_charuco_dictionary_and_board_are_constructed():
    dictionary = dictionary_from_name("DICT_5X5_100")
    assert dictionary.bytesList.shape[0] == 100
    board = make_charuco_board(
        {
            "dictionary": "DICT_5X5_100",
            "squares_x": 7,
            "squares_y": 5,
            "square_length_m": 0.04,
            "marker_length_m": 0.03,
        }
    )
    assert len(board.getChessboardCorners()) == 24


def test_detect_charuco_supports_opencv_45_board_dictionary_attribute():
    """Ubuntu 22.04 OpenCV 4.5 has no CharucoDetector/getDictionary methods."""
    board = make_charuco_board(
        {
            "dictionary": "DICT_5X5_100",
            "squares_x": 7,
            "squares_y": 5,
            "square_length_m": 0.04,
            "marker_length_m": 0.03,
        }
    )
    if hasattr(board, "draw"):
        board_image = board.draw((700, 500), marginSize=20)
    else:
        board_image = board.generateImage((700, 500), marginSize=20)
    image = cv2.cvtColor(board_image, cv2.COLOR_GRAY2BGR)
    observation = detect_charuco(
        image,
        np.asarray([[700.0, 0.0, 350.0], [0.0, 700.0, 250.0], [0.0, 0.0, 1.0]]),
        np.zeros(5),
        board,
        minimum_corners=4,
    )
    assert len(observation.ids) >= 4


def test_relative_pose_uses_left_arm_as_reference():
    left = np.eye(4)
    middle = transform_matrix(np.eye(3), [1.0, 0.0, 0.0])
    result = relative_pose_from_board_poses({"l": left, "m": middle, "r": left})
    assert np.allclose(np.asarray(result["m"])[:3, 3], [-1.0, 0.0, 0.0])
    assert np.allclose(np.asarray(result["r"]), np.eye(4))


def test_hand_eye_solver_recovers_synthetic_tool_camera_transform():
    rng = np.random.default_rng(7)

    def random_rotation():
        vector = rng.normal(size=3)
        rotation, _ = __import__("cv2").Rodrigues(vector / np.linalg.norm(vector) * 0.8)
        return rotation

    expected = transform_matrix(random_rotation(), [0.1, 0.02, 0.3])
    board_in_base = transform_matrix(random_rotation(), [0.2, 0.1, 0.8])
    samples = []
    for _ in range(15):
        base_to_tool = transform_matrix(random_rotation(), rng.uniform(-0.4, 0.4, 3))
        target_to_camera = np.linalg.inv(expected) @ np.linalg.inv(base_to_tool) @ board_in_base
        samples.append(
            {
                "base_to_tool": base_to_tool.tolist(),
                "target_to_camera": target_to_camera.tolist(),
            }
        )
    solved = solve_hand_eye(samples, "TSAI")
    assert solved["mean_residual_m"] < 1.0e-9
    assert np.allclose(np.asarray(solved["tool_to_camera"]), expected, atol=1.0e-8)


def test_layout_update_preserves_comments_and_composes_relative_pose(tmp_path):
    source = Path(__file__).parents[4] / "config" / "ros" / "three_robots.yaml"
    path = tmp_path / "three_robots.yaml"
    path.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
    backup = update_layout_file(
        path,
        {
            "m": transform_matrix(np.eye(3), [2.0, 0.5, 0.1]).tolist(),
            "r": transform_matrix(np.eye(3), [0.0, -1.0, 0.0]).tolist(),
        },
    )
    updated = yaml.safe_load(path.read_text(encoding="utf-8"))
    assert updated["robots"]["l"]["x"] == -1.0
    assert np.isclose(updated["robots"]["m"]["x"], 1.0)
    assert np.isclose(updated["robots"]["m"]["y"], 0.5)
    assert np.isclose(updated["robots"]["r"]["x"], -1.0)
    assert "Coordinates are expressed in metres" in path.read_text(encoding="utf-8")
    assert backup is not None and backup.is_file()
