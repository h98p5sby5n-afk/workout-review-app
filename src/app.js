const BODY_ORDER = ["胸", "背中", "肩", "腕", "脚", "体幹", "有酸素", "その他"];
const MAIN_SET_SUMMARY_BODIES = ["胸", "肩", "背中"];
const DETAIL_TRACKED_BODIES = new Set(MAIN_SET_SUMMARY_BODIES);
const MUSCLE_DETAILS = {
  chestDelt: {
    label: "胸+三角筋前部",
    target: "6-10",
    targetMin: 6,
    targetMax: 10,
    color: "#ba4a4a"
  },
  medialDelt: {
    label: "中部三角筋",
    target: "6-10",
    targetMin: 6,
    targetMax: 10,
    color: "#b7791f"
  },
  rearDeltTrap: {
    label: "後部三角筋・僧帽筋中下部",
    target: "4-8",
    targetMin: 4,
    targetMax: 8,
    color: "#8762a9"
  },
  lat: {
    label: "広背筋",
    target: "6-10",
    targetMin: 6,
    targetMax: 10,
    color: "#3b6ea8"
  },
  erector: {
    label: "脊柱起立筋",
    target: "2-6",
    targetMin: 2,
    targetMax: 6,
    color: "#2f7d64"
  }
};
const MAIN_SET_DETAIL_GROUPS = {
  胸: [],
  肩: ["medialDelt", "rearDeltTrap"],
  背中: ["lat", "rearDeltTrap", "erector"]
};
const SHARED_DETAIL_IDS = new Set(["rearDeltTrap"]);
const MUSCLE_DETAIL_RULES = [
  {
    id: "erector",
    pattern: /back extension|hyperextension|バックエクステンション|バックエクステ|ハイパーエクステンション/
  },
  {
    id: "rearDeltTrap",
    pattern: /rear delt|rear-delt|rear raise|face pull|shrug|row|リアレイズ|フェイスプル/
  },
  {
    id: "medialDelt",
    pattern: /lateral raise|side\s*raise|shoulder press|iso lateral shoulder press|サイドレイズ|ショルダープレス/
  },
  {
    id: "lat",
    pattern: /lat|pulldown|pull down|chin-up|pullover|ラット|プルダウン/
  },
  {
    id: "chestDelt",
    pattern: /chest|incline press|decline bench|bench press|pec|fly|dip|チェスト|インクライン/
  }
];
const ACTIVE_EXERCISE_DAYS = 90;
const BODY_COLORS = {
  胸: "#ba4a4a",
  背中: "#3b6ea8",
  肩: "#b7791f",
  腕: "#7357a4",
  脚: "#2f7d64",
  体幹: "#1f7a83",
  有酸素: "#57606a",
  その他: "#7a8791"
};

const METRIC_LABELS = {
  mainWork: "メインセット仕事量",
  volume: "総ボリューム",
  topWeight: "最大重量",
  e1rm: "推定1RM",
  reps: "総レップ数",
  sets: "セット数"
};

const INBODY_METRICS = {
  weight: {
    label: "体重",
    unit: "kg",
    color: "#1f7a83",
    aliases: [/体重/, /weight/, /^wt$/]
  },
  skeletalMuscle: {
    label: "骨格筋量",
    unit: "kg",
    color: "#3b6ea8",
    aliases: [/骨格筋量/, /skeletalmuscle/, /skeletal.*muscle/, /\bsmm\b/, /musclemass/]
  },
  bodyFatPercent: {
    label: "体脂肪率",
    unit: "%",
    color: "#ba4a4a",
    aliases: [/体脂肪率/, /percentbodyfat/, /bodyfatpercent/, /\bpbf\b/, /fatpercent/, /bodyfat.*%/]
  },
  bmi: {
    label: "BMI",
    unit: "",
    color: "#7357a4",
    aliases: [/^bmi/, /bodymassindex/, /体格指数/]
  },
  muscleMass: {
    label: "筋肉量",
    unit: "kg",
    color: "#2f7d64",
    aliases: [/筋肉量/, /^musclemass/, /softleanmass/, /leanbodymass/]
  },
  bodyFatMass: {
    label: "体脂肪量",
    unit: "kg",
    color: "#b7791f",
    aliases: [/体脂肪量/, /bodyfatmass/, /^fatmass/]
  }
};
const INBODY_METRIC_KEYS = Object.keys(INBODY_METRICS);
const INBODY_SEGMENT_METRICS = {
  rightArmMuscle: {
    label: "右腕筋肉量",
    unit: "kg",
    color: "#3b6ea8",
    aliases: [/右腕筋肉量/, /rightarmmuscle/, /rightupperlimbmuscle/]
  },
  leftArmMuscle: {
    label: "左腕筋肉量",
    unit: "kg",
    color: "#7357a4",
    aliases: [/左腕筋肉量/, /leftarmmuscle/, /leftupperlimbmuscle/]
  },
  trunkMuscle: {
    label: "体幹筋肉量",
    unit: "kg",
    color: "#1f7a83",
    aliases: [/体幹筋肉量/, /trunkmuscle/]
  }
};
const INBODY_SEGMENT_KEYS = Object.keys(INBODY_SEGMENT_METRICS);
const INBODY_CORRELATION_CHARTS = [
  {
    canvasKey: "armCorrelationCanvas",
    legendKey: "armCorrelationLegend",
    muscleKeys: ["rightArmMuscle", "leftArmMuscle"],
    trainingBodies: ["胸", "肩"]
  },
  {
    canvasKey: "trunkCorrelationCanvas",
    legendKey: "trunkCorrelationLegend",
    muscleKeys: ["trunkMuscle"],
    trainingBodies: ["胸", "背中"]
  }
];
const INBODY_EMPTY_FILE_NAME = "未読み込み";
const DEFAULT_INBODY_RANGE = "730";

const DEFAULT_CSV_PATH = "./data/sample.csv";
const DEFAULT_CSV_NAME = "サンプルデータ";
const STORED_CSV_KEY = "workout-review.csvText.v1";
const STORED_CSV_NAME_KEY = "workout-review.csvName.v1";
const STORED_INBODY_CSV_KEY = "workout-review.inbodyCsvText.v1";
const STORED_INBODY_CSV_NAME_KEY = "workout-review.inbodyCsvName.v1";

const state = {
  workouts: [],
  fileName: DEFAULT_CSV_NAME,
  range: "all",
  body: "all",
  exercise: "",
  metric: "mainWork",
  search: "",
  page: "training",
  inbodyRecords: [],
  inbodyFileName: INBODY_EMPTY_FILE_NAME,
  inbodyError: "",
  inbodyRange: DEFAULT_INBODY_RANGE,
  inbodyMetric: "weight",
  inbodyPoints: [],
  trendPoints: [],
  chartPoints: { score: [], mainReps: [], mainWeight: [] }
};

const els = {
  summaryGrid: document.querySelector("#summaryGrid"),
  bodySummary: document.querySelector("#bodySummary"),
  bodyTabs: document.querySelector("#bodyTabs"),
  exerciseCards: document.querySelector("#exerciseCards"),
  trendPanel: document.querySelector("#trendPanel"),
  scoreCanvas: document.querySelector("#scoreCanvas"),
  bubbleCanvas: document.querySelector("#bubbleCanvas"),
  repsCanvas: document.querySelector("#repsCanvas"),
  weeklyCanvas: document.querySelector("#weeklyCanvas"),
  trendTitle: document.querySelector("#trendTitle"),
  trendStat: document.querySelector("#trendStat"),
  chartTooltip: document.querySelector("#chartTooltip"),
  exerciseTable: document.querySelector("#exerciseTable"),
  timeline: document.querySelector("#timeline"),
  insights: document.querySelector("#insights"),
  rangeSelect: document.querySelector("#rangeSelect"),
  bodySelect: document.querySelector("#bodySelect"),
  exerciseSelect: document.querySelector("#exerciseSelect"),
  searchInput: document.querySelector("#searchInput"),
  csvInput: document.querySelector("#csvInput"),
  fileButton: document.querySelector("#fileButton"),
  fileName: document.querySelector("#fileName"),
  dropZone: document.querySelector("#dropZone"),
  pageTrack: document.querySelector("#pageTrack"),
  pageViewport: document.querySelector("#pageViewport"),
  pageTabs: document.querySelectorAll(".page-tab"),
  inbodyCsvInput: document.querySelector("#inbodyCsvInput"),
  inbodyFileButton: document.querySelector("#inbodyFileButton"),
  inbodyFileName: document.querySelector("#inbodyFileName"),
  inbodyDropZone: document.querySelector("#inbodyDropZone"),
  inbodySummaryGrid: document.querySelector("#inbodySummaryGrid"),
  inbodyRangeSelect: document.querySelector("#inbodyRangeSelect"),
  inbodyMetricTabs: document.querySelector("#inbodyMetricTabs"),
  inbodyCanvas: document.querySelector("#inbodyCanvas"),
  inbodyStat: document.querySelector("#inbodyStat"),
  inbodyTooltip: document.querySelector("#inbodyTooltip"),
  armCorrelationCanvas: document.querySelector("#armCorrelationCanvas"),
  trunkCorrelationCanvas: document.querySelector("#trunkCorrelationCanvas"),
  armCorrelationLegend: document.querySelector("#armCorrelationLegend"),
  trunkCorrelationLegend: document.querySelector("#trunkCorrelationLegend"),
  backToBodyButton: document.querySelector("#backToBodyButton"),
  bodyExplorer: document.querySelector(".body-explorer")
};

const numberFmt = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 0 });
const decimalFmt = new Intl.NumberFormat("ja-JP", { maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short"
});
const shortDateFmt = new Intl.DateTimeFormat("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  weekday: "short"
});

function parseDelimitedLine(line, delimiter = ";") {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseCsvRows(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");
  if (!lines.length) return [];
  const sample = lines.slice(0, 12).join("\n");
  const delimiter = detectDelimiter(sample);
  return lines.map((line) => parseDelimitedLine(line, delimiter));
}

function detectDelimiter(text) {
  const candidates = [",", ";", "\t"];
  const counts = Object.fromEntries(candidates.map((item) => [item, 0]));
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (!inQuotes && char in counts) {
      counts[char] += 1;
    }
  }
  return candidates.sort((a, b) => counts[b] - counts[a])[0];
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMeasurementNumber(value) {
  if (value === undefined || value === null) return null;
  const cleaned = String(value)
    .trim()
    .replace(/[^\d.,+\-]/g, "")
    .replace(/,/g, ".");
  if (!cleaned || cleaned === "-" || cleaned === "+") return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function classifyBody(rawName) {
  const name = rawName.toLowerCase();
  if (/treadmill|bike|indoor bike|elliptical|cross-trainer|stairclimber|powermill/.test(name)) return "有酸素";
  if (/leg|squat|calf|lunge|ハック|レッグ/.test(name)) return "脚";
  if (/torso|plank|crunch|abdominal|rotation|腹|体幹/.test(name)) return "体幹";
  if (/lateral raise|shoulder|rear delt|rear-delt|rear raise|face pull|external rotation|shrug|リアレイズ|サイドレイズ|フェイスプル/.test(name)) return "肩";
  if (/back extension|hyperextension|バックエクステンション|バックエクステ|ハイパーエクステンション/.test(name)) return "背中";
  if (/curl|bicep|tricep|pushdown|extension|hammer|カール|トライセップス/.test(name)) return "腕";
  if (/lat|pulldown|pull down|chin-up|row|pullover|high row|ラット|ロウ/.test(name)) return "背中";
  if (/chest|incline press|bench|pec|fly|dip|press|チェスト|インクライン/.test(name)) return "胸";
  return "その他";
}

function classifyMuscleDetail(rawName) {
  const name = rawName.toLowerCase();
  const rule = MUSCLE_DETAIL_RULES.find((item) => item.pattern.test(name));
  if (!rule) return null;
  return {
    id: rule.id,
    ...MUSCLE_DETAILS[rule.id]
  };
}

function getMainSetCountingBodies(exercise, bodySet, detailGroups = MAIN_SET_DETAIL_GROUPS) {
  const detail = classifyMuscleDetail(exercise.name);
  const bodyNames = new Set();

  if (bodySet.has(exercise.body)) {
    bodyNames.add(exercise.body);
  }

  if (detail && SHARED_DETAIL_IDS.has(detail.id)) {
    Object.entries(detailGroups).forEach(([bodyName, detailIds]) => {
      if (bodySet.has(bodyName) && detailIds.includes(detail.id)) {
        bodyNames.add(bodyName);
      }
    });
  }

  return {
    bodyNames: [...bodyNames],
    detail
  };
}

function getMuscleDetailMarkup(name, body) {
  if (!DETAIL_TRACKED_BODIES.has(body)) return "";
  const detail = classifyMuscleDetail(name);
  const className = detail ? "exercise-detail-tag" : "exercise-detail-tag undefined";
  const label = detail ? `細分類 ${detail.label}` : "細分類 未定義";
  const style = detail ? ` style="--detail-color:${detail.color};"` : "";
  return `<span class="${className}"${style}>${escapeHtml(label)}</span>`;
}

function parseAdvagymCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const workouts = [];
  const user = {};
  let currentWorkout = null;
  let currentExercise = null;
  let currentHeader = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      currentHeader = null;
      continue;
    }

    const cells = parseDelimitedLine(line);
    const key = (cells[0] || "").replace(/^\uFEFF/, "");
    const value = cells.slice(1).join(";").trim();

    if (key === "User") {
      user.name = value;
      continue;
    }
    if (key === "Email") {
      user.email = value;
      continue;
    }
    if (key === "Workout date") {
      const date = new Date(value);
      currentWorkout = {
        id: `${workouts.length}-${date.getTime() || value}`,
        date,
        dateRaw: value,
        name: "",
        totalTimeMin: 0,
        totalVolumeTon: 0,
        exercises: []
      };
      workouts.push(currentWorkout);
      currentExercise = null;
      currentHeader = null;
      continue;
    }
    if (!currentWorkout) continue;

    if (key === "Workout name") {
      currentWorkout.name = value || "Workout";
      continue;
    }
    if (key === "Total time (min)") {
      currentWorkout.totalTimeMin = toNumber(value) || 0;
      continue;
    }
    if (key === "Total volume (ton)") {
      currentWorkout.totalVolumeTon = toNumber(value) || 0;
      continue;
    }
    if (key === "Exercise name") {
      currentExercise = {
        name: value,
        body: classifyBody(value),
        timeMin: 0,
        sets: [],
        type: "other",
        loadMode: /assisted/i.test(value) ? "assist" : "load"
      };
      currentWorkout.exercises.push(currentExercise);
      currentHeader = null;
      continue;
    }
    if (key === "Exercise time (min)" && currentExercise) {
      currentExercise.timeMin = toNumber(value) || 0;
      continue;
    }
    if (key === "Set") {
      currentHeader = cells.filter(Boolean);
      continue;
    }

    if (currentExercise && currentHeader && /^\d+$/.test(key)) {
      const row = {};
      currentHeader.forEach((header, index) => {
        row[header] = cells[index] || "";
      });
      const reps = toNumber(row.Reps);
      const weightKg = toNumber(row["Weight (kg)"]);
      const distanceM = toNumber(row["Distance (m)"]);
      const timeSec = toNumber(row["Time (sec)"]);
      const energyKcal = toNumber(row["Energy (kcal)"]);
      const set = {
        index: toNumber(row.Set) || currentExercise.sets.length + 1,
        reps,
        weightKg,
        weightLb: toNumber(row["Weight (lb)"]),
        distanceM,
        distanceMiles: toNumber(row["Distance (miles)"]),
        timeSec,
        energyKcal,
        restSec: toNumber(row["Rest (sec)"]) || 0
      };
      set.volumeKg = reps !== null && weightKg !== null ? reps * weightKg : 0;
      set.e1rmKg =
        reps !== null && weightKg !== null && currentExercise.loadMode === "load"
          ? weightKg * (1 + reps / 30)
          : null;
      currentExercise.sets.push(set);
    }
  }

  enrichWorkouts(workouts);
  annotateWorkouts(workouts);
  workouts.user = user;
  return workouts.sort((a, b) => b.date - a.date);
}

function parseInBodyCsv(text) {
  const rows = parseCsvRows(text).filter((row) => row.some((cell) => String(cell || "").trim()));
  if (!rows.length) return [];

  const headerMatch = rows
    .slice(0, 30)
    .map((row, index) => {
      const columns = detectInBodyColumns(row);
      const metricCount = INBODY_METRIC_KEYS.filter((key) => isColumnIndex(columns[key])).length;
      const score = (isColumnIndex(columns.date) ? 2 : 0) + metricCount;
      return { index, columns, score };
    })
    .sort((a, b) => b.score - a.score)[0];

  if (!headerMatch || headerMatch.score < 3) return [];

  const records = rows
    .slice(headerMatch.index + 1)
    .map((row) => {
      const date = parseInBodyDate(row[headerMatch.columns.date]);
      if (!date) return null;
      const metrics = {};
      INBODY_METRIC_KEYS.forEach((key) => {
        const index = headerMatch.columns[key];
        metrics[key] = isColumnIndex(index) ? toMeasurementNumber(row[index]) : null;
      });
      INBODY_SEGMENT_KEYS.forEach((key) => {
        const index = headerMatch.columns[key];
        metrics[key] = isColumnIndex(index) ? toMeasurementNumber(row[index]) : null;
      });
      if (!INBODY_METRIC_KEYS.some((key) => Number.isFinite(metrics[key]))) return null;
      return {
        date,
        dateKey: `${localDateKey(date)}-${date.getHours()}-${date.getMinutes()}`,
        ...metrics
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.date - b.date);

  const byDate = new Map();
  records.forEach((record) => byDate.set(record.dateKey, record));
  return [...byDate.values()].sort((a, b) => a.date - b.date);
}

function detectInBodyColumns(headers) {
  const normalized = headers.map((header) => normalizeHeader(header));
  const columns = {
    date: findInBodyColumn(normalized, [/測定日時/, /測定日/, /日時/, /日付/, /date/, /datetime/, /testdate/])
  };
  INBODY_METRIC_KEYS.forEach((key) => {
    columns[key] = findInBodyColumn(normalized, INBODY_METRICS[key].aliases, key);
  });
  INBODY_SEGMENT_KEYS.forEach((key) => {
    columns[key] = findInBodyColumn(normalized, INBODY_SEGMENT_METRICS[key].aliases, key);
  });
  return columns;
}

function findInBodyColumn(normalizedHeaders, aliases, metricKey = "") {
  return normalizedHeaders.findIndex((header) => {
    if (!header) return false;
    if (metricKey === "bodyFatPercent" && /mass|量|kg/.test(header) && !/%|率|percent|pbf/.test(header)) {
      return false;
    }
    if (metricKey === "bodyFatMass" && /%|率|percent|pbf/.test(header)) {
      return false;
    }
    if (metricKey === "muscleMass" && /骨格|skeletal|smm/.test(header)) {
      return false;
    }
    if (metricKey === "weight" && /target|目標|control|調節/.test(header)) return false;
    return aliases.some((alias) => alias.test(header));
  });
}

function isColumnIndex(value) {
  return Number.isInteger(value) && value >= 0;
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"))
    .replace(/\s+/g, "")
    .replace(/㎏/g, "kg")
    .replace(/％/g, "%")
    .replace(/[_.:/\\-]/g, "");
}

function parseInBodyDate(value) {
  if (value === undefined || value === null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const numeric = toMeasurementNumber(raw);
  if (Number.isFinite(numeric) && numeric > 20000 && numeric < 80000) {
    const date = new Date((numeric - 25569) * 86400000);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  const compact = raw.match(/^(\d{4})(\d{2})(\d{2})(?:\s*(\d{2})(\d{2})(\d{2})?)?$/);
  if (compact) {
    const date = new Date(
      Number(compact[1]),
      Number(compact[2]) - 1,
      Number(compact[3]),
      Number(compact[4] || 0),
      Number(compact[5] || 0),
      Number(compact[6] || 0)
    );
    return Number.isFinite(date.getTime()) ? date : null;
  }
  const normalized = raw
    .replace(/[年月]/g, "/")
    .replace(/[日]/g, "")
    .replace(/[.]/g, "/")
    .replace(/\s+/g, " ");
  const match = normalized.match(/(\d{2,4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (match) {
    let year = Number(match[1]);
    if (year < 100) year += 2000;
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] || 0);
    const minute = Number(match[5] || 0);
    const second = Number(match[6] || 0);
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date : null;
}

function enrichWorkouts(workouts) {
  workouts.forEach((workout) => {
    let computedVolumeKg = 0;
    let totalSets = 0;
    let totalReps = 0;
    let cardioSeconds = 0;
    let cardioDistanceM = 0;
    let cardioKcal = 0;

    workout.exercises.forEach((exercise) => {
      const strengthSets = exercise.sets.filter((set) => set.reps !== null && set.weightKg !== null);
      const cardioSets = exercise.sets.filter(
        (set) => set.distanceM !== null || set.timeSec !== null || set.energyKcal !== null
      );
      exercise.type = strengthSets.length ? "strength" : cardioSets.length ? "cardio" : "other";
      const mainSets = strengthSets.slice(-2);

      const metrics = {
        sets: exercise.sets.length,
        reps: sum(strengthSets, "reps"),
        volumeKg: sum(strengthSets, "volumeKg"),
        topWeightKg: maxValue(strengthSets, "weightKg"),
        bestE1rmKg: maxValue(strengthSets, "e1rmKg"),
        distanceM: sum(cardioSets, "distanceM"),
        timeSec: sum(cardioSets, "timeSec"),
        energyKcal: sum(cardioSets, "energyKcal"),
        mainSet: null,
        mainSets,
        mainSetCount: mainSets.length,
        mainWorkKg: null,
        bestSet: null
      };
      metrics.mainSet =
        strengthSets
          .slice()
          .sort((a, b) => b.volumeKg - a.volumeKg || b.weightKg - a.weightKg || b.reps - a.reps)[0] || null;
      metrics.mainWorkKg = metrics.mainSet ? metrics.mainSet.volumeKg : null;
      metrics.bestSet = strengthSets
        .slice()
        .sort((a, b) => (b.e1rmKg || b.weightKg || 0) - (a.e1rmKg || a.weightKg || 0))[0] || null;
      exercise.metrics = metrics;

      totalSets += metrics.sets;
      totalReps += metrics.reps;
      computedVolumeKg += metrics.volumeKg;
      cardioSeconds += metrics.timeSec;
      cardioDistanceM += metrics.distanceM;
      cardioKcal += metrics.energyKcal;
    });

    workout.metrics = {
      volumeKg: computedVolumeKg || workout.totalVolumeTon * 1000,
      sets: totalSets,
      reps: totalReps,
      cardioSeconds,
      cardioDistanceM,
      cardioKcal,
      strengthExerciseCount: workout.exercises.filter((exercise) => exercise.type === "strength").length,
      cardioExerciseCount: workout.exercises.filter((exercise) => exercise.type === "cardio").length
    };
  });
}

function annotateWorkouts(workouts) {
  const ascending = workouts.slice().sort((a, b) => a.date - b.date);
  const seen = new Set();
  const bestByExercise = new Map();

  ascending.forEach((workout) => {
    workout.annotations = { newExercises: [], prs: [] };
    workout.exercises.forEach((exercise) => {
      if (!seen.has(exercise.name)) {
        workout.annotations.newExercises.push(exercise.name);
        seen.add(exercise.name);
      }
      const best = exercise.metrics.bestE1rmKg || exercise.metrics.topWeightKg;
      if (exercise.type === "strength" && best !== null) {
        const previous = bestByExercise.get(exercise.name);
        if (previous === undefined || best > previous + 0.01) {
          workout.annotations.prs.push(exercise.name);
          bestByExercise.set(exercise.name, best);
        }
      }
    });
  });
}

function sum(items, key) {
  return items.reduce((total, item) => total + (Number.isFinite(item[key]) ? item[key] : 0), 0);
}

function maxValue(items, key) {
  const values = items.map((item) => item[key]).filter((value) => Number.isFinite(value));
  return values.length ? Math.max(...values) : null;
}

function getRangeWorkouts() {
  if (!state.workouts.length) return [];
  if (state.range === "all") return state.workouts;
  const latest = new Date(Math.max(...state.workouts.map((workout) => workout.date.getTime())));
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - Number(state.range));
  return state.workouts.filter((workout) => workout.date >= cutoff);
}

function getRangeInBodyRecords() {
  if (!state.inbodyRecords.length) return [];
  if (state.inbodyRange === "all") return state.inbodyRecords;
  const latest = new Date(Math.max(...state.inbodyRecords.map((record) => record.date.getTime())));
  const cutoff = new Date(latest);
  cutoff.setDate(cutoff.getDate() - Number(state.inbodyRange));
  return state.inbodyRecords.filter((record) => record.date >= cutoff);
}

function flattenExercises(workouts) {
  return workouts.flatMap((workout) =>
    workout.exercises.map((exercise) => ({
      workout,
      exercise,
      date: workout.date,
      name: exercise.name,
      body: exercise.body,
      type: exercise.type,
      loadMode: exercise.loadMode,
      metrics: exercise.metrics,
      sets: exercise.sets
    }))
  );
}

function getBodyFilteredRecords(workouts) {
  const records = flattenExercises(workouts);
  return state.body === "all" ? records : records.filter((record) => record.body === state.body);
}

function buildExerciseStats(workouts) {
  const map = new Map();
  flattenExercises(workouts).forEach((record) => {
    if (state.body !== "all" && record.body !== state.body) return;
    const existing = map.get(record.name) || {
      name: record.name,
      body: record.body,
      detail: classifyMuscleDetail(record.name),
      type: record.type,
      loadMode: record.loadMode,
      sessions: 0,
      sets: 0,
      reps: 0,
      volumeKg: 0,
      mainWorkTotalKg: 0,
      bestMainWorkKg: null,
      topWeightKg: null,
      bestE1rmKg: null,
      distanceM: 0,
      cardioSeconds: 0,
      energyKcal: 0,
      first: null,
      latest: null
    };
    existing.sessions += 1;
    existing.sets += record.metrics.sets;
    existing.reps += record.metrics.reps;
    existing.volumeKg += record.metrics.volumeKg;
    if (Number.isFinite(record.metrics.mainWorkKg)) existing.mainWorkTotalKg += record.metrics.mainWorkKg;
    existing.bestMainWorkKg = maxNullable(existing.bestMainWorkKg, record.metrics.mainWorkKg);
    existing.distanceM += record.metrics.distanceM;
    existing.cardioSeconds += record.metrics.timeSec;
    existing.energyKcal += record.metrics.energyKcal;
    existing.topWeightKg = maxNullable(existing.topWeightKg, record.metrics.topWeightKg);
    existing.bestE1rmKg = maxNullable(existing.bestE1rmKg, record.metrics.bestE1rmKg);
    existing.first = !existing.first || record.date < existing.first.date ? record : existing.first;
    existing.latest = !existing.latest || record.date > existing.latest.date ? record : existing.latest;
    map.set(record.name, existing);
  });
  return [...map.values()].sort((a, b) => {
    const diff = b.sessions - a.sessions;
    return diff || b.volumeKg - a.volumeKg || a.name.localeCompare(b.name, "ja");
  });
}

function maxNullable(a, b) {
  if (a === null || a === undefined) return Number.isFinite(b) ? b : null;
  if (b === null || b === undefined) return a;
  return Math.max(a, b);
}

function renderAll() {
  const rangeWorkouts = getRangeWorkouts();
  refreshBodyOptions(rangeWorkouts);
  refreshExerciseOptions(rangeWorkouts);
  els.fileName.textContent = state.fileName;
  els.inbodyFileName.textContent = state.inbodyFileName;
  renderSummary(rangeWorkouts);
  renderBodyTabs(rangeWorkouts);
  renderExerciseCards(rangeWorkouts);
  renderBodySummary(rangeWorkouts);
  renderTrend(rangeWorkouts);
  renderWeekly(rangeWorkouts);
  renderInsights(rangeWorkouts);
  renderExerciseTable(rangeWorkouts);
  renderTimeline(rangeWorkouts);
  renderInBody();
  renderPageState();
}

function refreshBodyOptions(workouts) {
  const strengthRecords = flattenExercises(workouts).filter((record) => record.type === "strength");
  const counts = countBy(strengthRecords, "body");
  const bodies = BODY_ORDER.filter((body) => counts.get(body));
  if (!bodies.includes(state.body)) state.body = bodies[0] || "all";
  els.bodySelect.innerHTML = bodies
    .map((body) => `<option value="${escapeAttr(body)}">${body} ${counts.get(body)}</option>`)
    .join("");
  els.bodySelect.value = state.body;
}

function refreshExerciseOptions(workouts) {
  const stats = getRankedExerciseStats(workouts);
  if (!stats.length) {
    state.exercise = "";
    els.exerciseSelect.innerHTML = `<option value="">該当なし</option>`;
    return;
  }
  if (!state.exercise || !stats.some((stat) => stat.name === state.exercise)) {
    state.exercise = stats[0].name;
  }
  els.exerciseSelect.innerHTML = stats
    .map((stat) => `<option value="${escapeAttr(stat.name)}">${escapeHtml(stat.name)} (${stat.sessions})</option>`)
    .join("");
  els.exerciseSelect.value = state.exercise;
}

function renderBodyTabs(workouts) {
  const bodyStats = getBodyStats(workouts).sort(
    (a, b) => BODY_ORDER.indexOf(a.body) - BODY_ORDER.indexOf(b.body)
  );
  els.bodyTabs.innerHTML = bodyStats
    .map((item) => {
      const active = item.body === state.body ? " active" : "";
      return `
        <button class="body-tab${active}" type="button" data-body="${escapeAttr(item.body)}" role="tab" aria-selected="${item.body === state.body}">
          <span class="body-tab-name">${escapeHtml(item.body)}</span>
          <span class="body-tab-meta">${numberFmt.format(item.sessions.size)}回</span>
        </button>
      `;
    })
    .join("");
}

function renderExerciseCards(workouts) {
  const stats = getRankedExerciseStats(workouts);
  if (!stats.length) {
    els.exerciseCards.innerHTML = `<div class="empty-state">この期間の筋トレ種目がありません</div>`;
    return;
  }
  els.exerciseCards.innerHTML = stats
    .map((stat, index) => {
      const selected = stat.name === state.exercise ? " selected" : "";
      const delta = getLatestDelta(stat, "bestMainWorkKg");
      const detailMarkup = getMuscleDetailMarkup(stat.name, stat.body);
      return `
        <button class="exercise-card${selected}" type="button" data-exercise="${escapeAttr(stat.name)}">
          <span class="exercise-rank">${index + 1}</span>
          <span class="exercise-card-main">
            <strong>${escapeHtml(stat.name)}</strong>
            <span>${numberFmt.format(stat.sessions)}回 / ${numberFmt.format(stat.sets)}セット / 最新 ${stat.latest ? shortDateFmt.format(stat.latest.date) : "—"}</span>
            ${detailMarkup}
          </span>
          <span class="exercise-card-score">
            <strong>${formatWork(stat.bestMainWorkKg)}</strong>
            <span>${formatDelta(delta, "mainWork")}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function getRankedExerciseStats(workouts) {
  return buildExerciseStats(workouts)
    .filter((stat) => stat.type === "strength")
    .filter((stat) => isActiveExercise(stat, state.workouts.length ? state.workouts : workouts))
    .sort((a, b) => {
      const setDiff = b.sets - a.sets;
      return setDiff || b.sessions - a.sessions || b.volumeKg - a.volumeKg || a.name.localeCompare(b.name, "ja");
    });
}

function isActiveExercise(stat, workouts) {
  if (!stat.latest || !workouts.length) return false;
  const latestWorkoutDate = new Date(Math.max(...workouts.map((workout) => workout.date.getTime())));
  const cutoff = startOfDay(latestWorkoutDate);
  cutoff.setDate(cutoff.getDate() - ACTIVE_EXERCISE_DAYS);
  return stat.latest.date >= cutoff;
}

function renderSummary(workouts) {
  const strengthWorkouts = workouts.filter((workout) => workout.metrics.strengthExerciseCount > 0);
  const records = flattenExercises(workouts);
  const strengthRecords = records.filter((record) => record.type === "strength");
  const totalVolume = sum(workouts.map((workout) => workout.metrics), "volumeKg");
  const totalSets = sum(strengthRecords.map((record) => record.metrics), "sets");
  const dateRange = getDateRangeLabel(workouts);

  const cards = [
    {
      label: "記録期間",
      value: dateRange.value,
      sub: dateRange.sub
    },
    {
      label: "筋トレ回数",
      value: `${numberFmt.format(strengthWorkouts.length)}回`,
      sub: `${numberFmt.format(workouts.length)}ワークアウト中`
    },
    {
      label: "総ボリューム",
      value: formatTon(totalVolume),
      sub: `${numberFmt.format(totalSets)}セット / ${numberFmt.format(sum(strengthRecords.map((r) => r.metrics), "reps"))}レップ`
    }
  ];

  els.summaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="kpi-card">
          <div class="kpi-label">${escapeHtml(card.label)}</div>
          <div class="kpi-value">${escapeHtml(card.value)}</div>
          <div class="kpi-sub">${escapeHtml(card.sub)}</div>
        </article>
      `
    )
    .join("");
}

function renderInBody() {
  const records = getRangeInBodyRecords();
  renderInBodySummary(records);
  renderInBodyMetricTabs(records);
  drawInBodyChart(records);
  renderInBodyCorrelation(records);
}

function renderInBodySummary(records) {
  const range = getDateRangeLabel(records);
  const latest = records[records.length - 1];
  const cards = [
    {
      label: "記録期間",
      value: range.value,
      sub: range.sub
    },
    {
      label: "測定回数",
      value: `${numberFmt.format(records.length)}回`,
      sub: state.inbodyError
        ? state.inbodyError
        : state.inbodyRecords.length
        ? `${numberFmt.format(state.inbodyRecords.length)}件中`
        : "InBody CSVを読み込んでください"
    },
    {
      label: "最新測定",
      value: latest ? shortDateFmt.format(latest.date) : "—",
      sub: latest ? `${formatInBodyValue(latest.weight, "weight")} / ${formatInBodyValue(latest.bodyFatPercent, "bodyFatPercent")}` : "データなし"
    }
  ];

  els.inbodySummaryGrid.innerHTML = cards
    .map(
      (card) => `
        <article class="kpi-card">
          <div class="kpi-label">${escapeHtml(card.label)}</div>
          <div class="kpi-value">${escapeHtml(card.value)}</div>
          <div class="kpi-sub">${escapeHtml(card.sub)}</div>
        </article>
      `
    )
    .join("");
}

function renderInBodyMetricTabs(records) {
  const latest = records[records.length - 1] || null;
  const first = records[0] || null;
  els.inbodyMetricTabs.innerHTML = INBODY_METRIC_KEYS.map((key) => {
    const metric = INBODY_METRICS[key];
    const active = key === state.inbodyMetric ? " active" : "";
    const latestValue = latest?.[key];
    const delta = first && latest && Number.isFinite(latestValue) && Number.isFinite(first[key]) ? latestValue - first[key] : null;
    const label = metric.unit ? `${metric.label} (${metric.unit})` : metric.label;
    return `
      <button class="metric-tab${active}" type="button" data-inbody-metric="${escapeAttr(key)}" role="tab" aria-selected="${key === state.inbodyMetric}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(formatInBodyNumber(latestValue))}</strong>
        <em>${formatInBodyDelta(delta, key)}</em>
      </button>
    `;
  }).join("");
}

function drawInBodyChart(records) {
  const metricKey = state.inbodyMetric;
  const metric = INBODY_METRICS[metricKey];
  const { ctx, width, height } = setupCanvas(els.inbodyCanvas);
  const pad = { left: 58, right: 58, top: 28, bottom: 46 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  const series = records
    .filter((record) => Number.isFinite(record[metricKey]))
    .map((record) => ({
      date: record.date,
      value: record[metricKey],
      record
    }))
    .sort((a, b) => a.date - b.date);

  if (!series.length) {
    drawEmptyChart(ctx, width, height, state.inbodyRecords.length ? "この期間のデータがありません" : "InBody CSVを読み込んでください");
    state.inbodyPoints = [];
    els.inbodyStat.innerHTML = `<strong>—</strong><span>${escapeHtml(metric.label)}</span>`;
    return;
  }

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.max(1, max * 0.04);
  const yMin = Math.max(0, min - spread * 0.2);
  const yMax = max + spread * 0.2;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const timeDomain = getTimeDomain(series.map((point) => point.date));
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;
  const yFor = (value) => pad.top + plotH - ((value - yMin) / (yMax - yMin || 1)) * plotH;
  const points = series.map((point) => ({
    x: xFor(point.date),
    y: yFor(point.value),
    point
  }));

  drawInBodyGrid(ctx, width, height, pad, yMin, yMax, metricKey);
  drawMonthAxis(ctx, width, height, pad, timeDomain);

  ctx.strokeStyle = "rgba(107, 117, 128, 0.28)";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  ctx.strokeStyle = metric.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = "#fff";
    ctx.arc(point.x, point.y, 5.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = metric.color;
    ctx.stroke();
  });

  state.inbodyPoints = points;
  els.inbodyStat.innerHTML = buildInBodyStat(series, metricKey);
}

function renderInBodyCorrelation(records) {
  INBODY_CORRELATION_CHARTS.forEach((config) => {
    const canvas = els[config.canvasKey];
    const legend = els[config.legendKey];
    if (!canvas || !legend) return;
    legend.innerHTML = buildCorrelationLegend(config);
    drawInBodyCorrelationChart(canvas, records, config);
  });
}

function buildCorrelationLegend(config) {
  const muscleItems = config.muscleKeys.map((key) => {
    const metric = INBODY_SEGMENT_METRICS[key];
    return `<span><i style="background:${metric.color}"></i>${escapeHtml(metric.label)}</span>`;
  });
  const setItems = config.trainingBodies.map(
    (body) => `<span><i class="bar" style="background:${BODY_COLORS[body]}"></i>${escapeHtml(body)}週次メインセット</span>`
  );
  return [...muscleItems, ...setItems].join("");
}

function drawInBodyCorrelationChart(canvas, records, config) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 58, right: 30, top: 28, bottom: 44 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  const lineSeries = config.muscleKeys
    .map((key) => ({
      key,
      metric: INBODY_SEGMENT_METRICS[key],
      points: records
        .filter((record) => Number.isFinite(record[key]))
        .map((record) => ({ date: record.date, value: record[key] }))
        .sort((a, b) => a.date - b.date)
    }))
    .filter((line) => line.points.length);

  if (!lineSeries.length) {
    drawEmptyChart(ctx, width, height, state.inbodyRecords.length ? "部位別筋肉量の列がありません" : "InBody CSVを読み込んでください");
    return;
  }

  const recordDates = lineSeries.flatMap((line) => line.points.map((point) => point.date));
  const rawDomain = getRawTimeDomain(recordDates);
  const timeDomain = getTimeDomain(recordDates);
  const weeklySets = getWeeklyBodySetBuckets(state.workouts, config.trainingBodies, rawDomain);
  const plotW = width - pad.left - pad.right;
  const muscleTop = pad.top;
  const muscleBottom = Math.round(height * 0.48);
  const setTop = muscleBottom + 38;
  const setBottom = height - pad.bottom;
  const setRowGap = height < 420 ? 18 : 24;
  const setRowHeight = Math.max(34, (setBottom - setTop - setRowGap * (config.trainingBodies.length - 1)) / config.trainingBodies.length);
  const setRows = config.trainingBodies.map((body, index) => {
    const rowTop = setTop + index * (setRowHeight + setRowGap);
    return {
      body,
      top: rowTop,
      bottom: rowTop + setRowHeight
    };
  });
  const muscleH = muscleBottom - muscleTop;
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;

  drawCorrelationTimeGrid(ctx, width, height, pad, timeDomain, muscleTop, setBottom);
  drawCorrelationMuscleAxis(ctx, width, pad, muscleTop, muscleBottom, lineSeries);

  const muscleValues = lineSeries.flatMap((line) => line.points.map((point) => point.value));
  const muscleMin = Math.min(...muscleValues);
  const muscleMax = Math.max(...muscleValues);
  const muscleSpread = muscleMax - muscleMin || Math.max(0.2, muscleMax * 0.03);
  const yMin = Math.max(0, muscleMin - muscleSpread * 0.24);
  const yMax = muscleMax + muscleSpread * 0.24;
  const yForMuscle = (value) => muscleTop + muscleH - ((value - yMin) / (yMax - yMin || 1)) * muscleH;

  ctx.save();
  ctx.strokeStyle = "#cad4db";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(pad.left, muscleBottom + 18);
  ctx.lineTo(width - pad.right, muscleBottom + 18);
  ctx.stroke();
  ctx.restore();

  drawCorrelationWeeklySetRows(ctx, width, pad, timeDomain, weeklySets, setRows);

  lineSeries.forEach((line) => {
    const points = line.points.map((point) => ({
      x: xFor(point.date),
      y: yForMuscle(point.value),
      value: point.value
    }));
    ctx.strokeStyle = "rgba(107, 117, 128, 0.22)";
    ctx.lineWidth = 5.4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    points.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    ctx.stroke();

    ctx.strokeStyle = line.metric.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    points.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
    ctx.stroke();

    points.forEach((point) => {
      ctx.beginPath();
      ctx.fillStyle = "#fff";
      ctx.arc(point.x, point.y, 4.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.1;
      ctx.strokeStyle = line.metric.color;
      ctx.stroke();
    });
  });

  drawCorrelationLabels(ctx, pad, muscleTop, setTop);
}

function getRawTimeDomain(dates) {
  const times = dates.map((date) => date?.getTime?.()).filter((time) => Number.isFinite(time));
  if (!times.length) return { min: 0, max: 1 };
  const min = Math.min(...times);
  const max = Math.max(...times);
  return min === max ? { min: min - 86400000, max: max + 86400000 } : { min, max };
}

function getWeeklyBodySetBuckets(workouts, bodies, domain) {
  const start = startOfWeek(new Date(domain.min));
  const end = startOfWeek(new Date(domain.max));
  const buckets = [];
  for (let cursor = new Date(start); cursor <= end; cursor = addDays(cursor, 7)) {
    const bucketStart = new Date(cursor);
    const bucketEnd = addDays(bucketStart, 7);
    const bucketMid = new Date(bucketStart.getTime() + 3.5 * 86400000);
    buckets.push({
      key: localDateKey(bucketStart),
      start: bucketStart,
      end: bucketEnd,
      mid: bucketMid,
      counts: Object.fromEntries(bodies.map((body) => [body, 0]))
    });
  }

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const bodySet = new Set(bodies);
  workouts
    .filter((workout) => workout.date instanceof Date && workout.date.getTime() >= domain.min && workout.date.getTime() <= domain.max)
    .forEach((workout) => {
      const key = localDateKey(startOfWeek(workout.date));
      const bucket = bucketMap.get(key);
      if (!bucket) return;
      workout.exercises
        .filter((exercise) => exercise.type === "strength")
        .forEach((exercise) => {
          const mainSetCount = exercise.metrics.mainSetCount || 0;
          const { bodyNames } = getMainSetCountingBodies(exercise, bodySet);
          bodyNames.forEach((bodyName) => {
            bucket.counts[bodyName] += mainSetCount;
          });
        });
    });

  return buckets;
}

function drawCorrelationWeeklySetRows(ctx, width, pad, timeDomain, weeklySets, rows) {
  const plotW = width - pad.left - pad.right;
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;

  rows.forEach((row) => {
    const maxSets = Math.max(1, ...weeklySets.map((bucket) => bucket.counts[row.body] || 0));
    const rowHeight = row.bottom - row.top;
    const color = BODY_COLORS[row.body] || "#64717c";

    ctx.save();
    ctx.strokeStyle = "#dce4e9";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, row.top);
    ctx.lineTo(width - pad.right, row.top);
    ctx.moveTo(pad.left, row.bottom);
    ctx.lineTo(width - pad.right, row.bottom);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = "700 12px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(`${row.body} / 最大${numberFmt.format(maxSets)}set`, pad.left, row.top - 4);

    ctx.fillStyle = "#64717c";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillText(`${numberFmt.format(maxSets)}`, pad.left - 8, row.top);
    ctx.fillText("0", pad.left - 8, row.bottom);
    ctx.restore();

    weeklySets.forEach((bucket) => {
      const value = bucket.counts[row.body] || 0;
      if (!value) return;
      const weekStartX = xFor(bucket.start);
      const weekEndX = xFor(bucket.end);
      const barWidth = Math.max(1.2, Math.min(8, Math.abs(weekEndX - weekStartX) * 0.78));
      const x = xFor(bucket.mid);
      const barHeight = Math.max(2, (value / maxSets) * rowHeight);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.84;
      ctx.fillRect(x - barWidth / 2, row.bottom - barHeight, barWidth, barHeight);
      ctx.globalAlpha = 1;
    });
  });
}

function drawCorrelationTimeGrid(ctx, width, height, pad, timeDomain, top, bottom) {
  const plotW = width - pad.left - pad.right;
  const start = new Date(timeDomain.min);
  start.setHours(0, 0, 0, 0);
  start.setDate(1);
  if (start.getTime() < timeDomain.min) start.setMonth(start.getMonth() + 1);

  const ticks = [];
  for (let cursor = new Date(start); cursor.getTime() <= timeDomain.max; cursor.setMonth(cursor.getMonth() + 1)) {
    ticks.push(new Date(cursor));
  }
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;

  ctx.save();
  ctx.strokeStyle = "rgba(112, 124, 135, 0.16)";
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ticks.forEach((tick, index) => {
    const x = xFor(tick);
    if (x < pad.left || x > width - pad.right) return;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    if (index % Math.max(1, Math.ceil(ticks.length / 6)) === 0 || index === ticks.length - 1) {
      ctx.fillText(`${tick.getMonth() + 1}月`, x, height - pad.bottom + 16);
    }
  });
  ctx.restore();
}

function drawCorrelationMuscleAxis(ctx, width, pad, top, bottom, lineSeries) {
  const values = lineSeries.flatMap((line) => line.points.map((point) => point.value));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.max(0.2, max * 0.03);
  const yMin = Math.max(0, min - spread * 0.24);
  const yMax = max + spread * 0.24;
  const plotH = bottom - top;

  ctx.save();
  ctx.strokeStyle = "#dce4e9";
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 3; i += 1) {
    const y = top + (plotH * i) / 3;
    const value = yMax - ((yMax - yMin) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatKg(value), pad.left - 8, y);
  }
  ctx.restore();
}

function drawCorrelationLabels(ctx, pad, muscleTop, setTop) {
  ctx.save();
  ctx.fillStyle = "#64717c";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("部位別筋肉量", pad.left, muscleTop - 20);
  ctx.fillText("週次メインセット", pad.left, setTop - 20);
  ctx.restore();
}

function drawInBodyGrid(ctx, width, height, pad, yMin, yMax, metricKey) {
  const plotH = height - pad.top - pad.bottom;
  ctx.strokeStyle = "#dce4e9";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 3; i += 1) {
    const y = pad.top + (plotH * i) / 3;
    const value = yMax - ((yMax - yMin) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatInBodyValue(value, metricKey), pad.left - 8, y);
  }
}

function buildInBodyStat(series, metricKey) {
  const first = series[0];
  const latest = series[series.length - 1];
  const delta = latest.value - first.value;
  return `
    <strong>${escapeHtml(formatInBodyValue(latest.value, metricKey))}</strong>
    <span>${numberFmt.format(series.length)}回 / ${escapeHtml(formatInBodyDelta(delta, metricKey))}</span>
  `;
}

function buildInBodyTooltip(point) {
  const data = point.point;
  return `
    <strong>${escapeHtml(dateFmt.format(data.date))}</strong><br>
    ${escapeHtml(INBODY_METRICS[state.inbodyMetric].label)}: ${escapeHtml(formatInBodyValue(data.value, state.inbodyMetric))}
  `;
}

function renderBodySummary(workouts) {
  const mainSetStats = getRollingMainSetStats(workouts);
  const undefinedDetails = getUndefinedMuscleDetailExercises(workouts);

  const rollingMarkup = `
    <div class="main-set-summary">
      <div class="main-set-summary-head">
        <strong>7日メインセット</strong>
        <span>直近21日の7日推移</span>
      </div>
      <div class="main-set-summary-rows">
        ${mainSetStats.rows
          .map(
            (row) => `
              <div class="main-set-row">
                <div class="main-set-body">
                  <strong style="color:${row.color}">${escapeHtml(row.body)}</strong>
                  <span>${numberFmt.format(row.latest)}セット</span>
                </div>
                <div class="main-set-visuals">
                  ${renderMainSetBars(row.points, row.color, mainSetStats.scaleMax)}
                  <div class="main-set-detail-rows">
                    ${row.details
                      .map(
                        (detail) => `
                          <div class="main-set-detail-row">
                            <div class="main-set-detail-label" style="--detail-color:${detail.color};">
                              <strong>${escapeHtml(detail.label)}</strong>
                              <span>${numberFmt.format(detail.latest)}セット / ${escapeHtml(detail.target)}セット</span>
                            </div>
                            ${renderMainSetLine(detail.points, detail.color, detail.scaleMax, {
                              targetMin: detail.targetMin,
                              targetMax: detail.targetMax
                            })}
                          </div>
                        `
                      )
                      .join("")}
                  </div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
      ${
        undefinedDetails.length
          ? `<div class="main-set-undefined"><strong>細分類未定義</strong><span>${undefinedDetails
              .map((item) => `${escapeHtml(item.name)} (${numberFmt.format(item.sets)}セット)`)
              .join("、")}</span></div>`
          : ""
      }
      <div class="main-set-axis">
        <span>${escapeHtml(mainSetStats.days[0]?.label || "")}</span>
        <span>${escapeHtml(mainSetStats.days[Math.floor(mainSetStats.days.length / 2)]?.label || "")}</span>
        <span>${escapeHtml(mainSetStats.days[mainSetStats.days.length - 1]?.label || "")}</span>
      </div>
    </div>
  `;

  els.bodySummary.innerHTML = rollingMarkup;
}

function renderMainSetBars(points, color, scaleMax, className = "main-set-bars", options = {}) {
  const targetStyle =
    Number.isFinite(options.targetMin) && Number.isFinite(options.targetMax)
      ? ` --target-min:${Math.min(100, (options.targetMin / scaleMax) * 100)}%; --target-max:${Math.min(100, (options.targetMax / scaleMax) * 100)}%;`
      : "";
  return `
    <div class="${escapeAttr(className)}" style="--target:${Math.min(100, (10 / scaleMax) * 100)}%;${targetStyle}">
      ${points
        .map(
          (point) => `
            <span
              title="${escapeAttr(`${point.label} ${numberFmt.format(point.count)}セット`)}"
              style="height:${point.count ? Math.max(6, (point.count / scaleMax) * 100) : 0}%; background:${color};"
            ></span>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMainSetLine(points, color, scaleMax, options = {}) {
  const width = 240;
  const height = 54;
  const padX = 2;
  const padTop = 5;
  const padBottom = 8;
  const plotHeight = height - padTop - padBottom;
  const xStep = points.length > 1 ? (width - padX * 2) / (points.length - 1) : 0;
  const toY = (count) => padTop + plotHeight - (Math.min(scaleMax, count) / scaleMax) * plotHeight;
  const pointData = points.map((point, index) => ({
    ...point,
    x: padX + xStep * index,
    y: toY(point.count || 0)
  }));
  const path = pointData
    .map((point, index) => `${index ? "L" : "M"} ${roundChart(point.x)} ${roundChart(point.y)}`)
    .join(" ");
  const areaPath = `${path} L ${roundChart(padX + xStep * Math.max(0, points.length - 1))} ${height - padBottom} L ${padX} ${height - padBottom} Z`;
  const targetMinY = Number.isFinite(options.targetMin) ? toY(options.targetMin) : null;
  const targetMaxY = Number.isFinite(options.targetMax) ? toY(options.targetMax) : null;
  const targetBand =
    targetMinY !== null && targetMaxY !== null
      ? `<rect x="${padX}" y="${roundChart(targetMaxY)}" width="${width - padX * 2}" height="${Math.max(1, roundChart(targetMinY - targetMaxY))}" fill="${escapeAttr(color)}" opacity="0.08"></rect>
         <line x1="${padX}" y1="${roundChart(targetMinY)}" x2="${width - padX}" y2="${roundChart(targetMinY)}" class="target-line strong"></line>
         <line x1="${padX}" y1="${roundChart(targetMaxY)}" x2="${width - padX}" y2="${roundChart(targetMaxY)}" class="target-line"></line>`
      : "";

  return `
    <div class="main-set-line" style="--detail-color:${color};">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(points.map((point) => `${point.label} ${numberFmt.format(point.count)}セット`).join("、"))}">
        ${targetBand}
        <path class="line-area" d="${escapeAttr(areaPath)}"></path>
        <path class="line-stroke" d="${escapeAttr(path)}"></path>
        ${pointData
          .map(
            (point) => `
              <circle cx="${roundChart(point.x)}" cy="${roundChart(point.y)}" r="${point.count ? 2.2 : 1.4}">
                <title>${escapeHtml(`${point.label} ${numberFmt.format(point.count)}セット`)}</title>
              </circle>
            `
          )
          .join("")}
      </svg>
    </div>
  `;
}

function roundChart(value) {
  return Math.round(value * 10) / 10;
}

function getRollingMainSetStats(workouts, options = {}) {
  const bodies = options.bodies || MAIN_SET_SUMMARY_BODIES;
  const detailGroups = options.detailGroups || MAIN_SET_DETAIL_GROUPS;
  const days = options.days || 21;
  const windowDays = options.windowDays || 7;
  const datedWorkouts = workouts
    .filter((workout) => workout.date instanceof Date && Number.isFinite(workout.date.getTime()))
    .sort((a, b) => a.date - b.date);

  if (!datedWorkouts.length) {
    return {
      bodies,
      windowDays,
      scaleMax: 15,
      days: [],
      rows: bodies.map((body) => ({
        body,
        color: BODY_COLORS[body],
        latest: 0,
        points: [],
        details: (detailGroups[body] || []).map((id) => {
          const definition = MUSCLE_DETAILS[id];
          return {
            id,
            ...definition,
            latest: 0,
            scaleMax: definition.targetMax || 10,
            points: []
          };
        })
      }))
    };
  }

  const latestDate = startOfDay(new Date(Math.max(...datedWorkouts.map((workout) => workout.date.getTime()))));
  const firstDate = addDays(latestDate, -(Math.max(1, days) - 1));
  const bodySet = new Set(bodies);
  const detailIds = [...new Set(Object.values(detailGroups).flat())];
  const sharedDetailIds = detailIds.filter((detailId) => SHARED_DETAIL_IDS.has(detailId));
  const dailyCounts = new Map();
  const makeEmptyDay = () => ({
    bodies: Object.fromEntries(bodies.map((bodyName) => [bodyName, 0])),
    details: Object.fromEntries(
      bodies.map((bodyName) => [
        bodyName,
        Object.fromEntries((detailGroups[bodyName] || []).map((detailId) => [detailId, 0]))
      ])
    ),
    sharedDetails: Object.fromEntries(sharedDetailIds.map((detailId) => [detailId, 0]))
  });

  datedWorkouts.forEach((workout) => {
    const key = localDateKey(workout.date);
    const item = dailyCounts.get(key) || makeEmptyDay();

    workout.exercises
      .filter((exercise) => exercise.type === "strength")
      .forEach((exercise) => {
        const mainSetCount = exercise.metrics.mainSetCount || 0;
        const { bodyNames, detail } = getMainSetCountingBodies(exercise, bodySet, detailGroups);
        bodyNames.forEach((bodyName) => {
          item.bodies[bodyName] += mainSetCount;
        });
        if (!detail) return;
        if (SHARED_DETAIL_IDS.has(detail.id) && detail.id in item.sharedDetails) {
          item.sharedDetails[detail.id] += mainSetCount;
        } else if (item.details[exercise.body] && detail.id in item.details[exercise.body]) {
          item.details[exercise.body][detail.id] += mainSetCount;
        }
      });

    dailyCounts.set(key, item);
  });

  const points = [];
  for (let cursor = firstDate; cursor <= latestDate; cursor = addDays(cursor, 1)) {
    const counts = {};
    const detailCounts = Object.fromEntries(
      bodies.map((bodyName) => [
        bodyName,
        Object.fromEntries((detailGroups[bodyName] || []).map((detailId) => [detailId, 0]))
      ])
    );
    bodies.forEach((bodyName) => {
      let count = 0;
      for (let offset = 0; offset < windowDays; offset += 1) {
        const bucket = dailyCounts.get(localDateKey(addDays(cursor, -offset)));
        count += bucket?.bodies?.[bodyName] || 0;
        (detailGroups[bodyName] || []).forEach((detailId) => {
          detailCounts[bodyName][detailId] += SHARED_DETAIL_IDS.has(detailId)
            ? bucket?.sharedDetails?.[detailId] || 0
            : bucket?.details?.[bodyName]?.[detailId] || 0;
        });
      }
      counts[bodyName] = count;
    });

    points.push({
      date: new Date(cursor),
      label: shortDateFmt.format(cursor),
      counts,
      detailCounts
    });
  }

  const maxCount = Math.max(1, ...points.flatMap((point) => bodies.map((bodyName) => point.counts[bodyName])));
  const latestPoint = points[points.length - 1];

  return {
    bodies,
    windowDays,
    scaleMax: Math.max(15, maxCount),
    days: points,
    rows: bodies.map((bodyName) => ({
      body: bodyName,
      color: BODY_COLORS[bodyName],
      latest: latestPoint?.counts[bodyName] || 0,
      points: points.map((point) => ({
        date: point.date,
        label: point.label,
        count: point.counts[bodyName]
      })),
      details: (detailGroups[bodyName] || []).map((detailId) => {
        const detailPoints = points.map((point) => ({
          date: point.date,
          label: point.label,
          count: point.detailCounts[bodyName][detailId]
        }));
        const definition = MUSCLE_DETAILS[detailId];
        const maxDetailCount = Math.max(1, ...detailPoints.map((point) => point.count));
        return {
          id: detailId,
          ...definition,
          latest: latestPoint?.detailCounts?.[bodyName]?.[detailId] || 0,
          scaleMax: Math.max(definition.targetMax || 0, maxDetailCount),
          points: detailPoints
        };
      })
    }))
  };
}

function getUndefinedMuscleDetailExercises(workouts) {
  const map = new Map();
  flattenExercises(workouts).forEach((record) => {
    if (record.type !== "strength" || !DETAIL_TRACKED_BODIES.has(record.body)) return;
    if (classifyMuscleDetail(record.name)) return;
    const item = map.get(record.name) || { name: record.name, body: record.body, sets: 0, sessions: 0 };
    item.sets += record.metrics.sets;
    item.sessions += 1;
    map.set(record.name, item);
  });
  return [...map.values()].sort((a, b) => b.sets - a.sets || a.name.localeCompare(b.name, "ja"));
}

function renderTrend(workouts) {
  const records = getBodyFilteredRecords(workouts)
    .filter((record) => record.type === "strength" && record.name === state.exercise)
    .sort((a, b) => a.date - b.date);

  let bestE1rm = 0;
  const scoreSeries = [];
  const repSeries = [];
  const weightSeries = [];

  records.forEach((record) => {
    const mainSet = record.metrics.mainSet;
    const e1rm = record.metrics.bestE1rmKg;
    const isPr = Number.isFinite(e1rm) && e1rm > bestE1rm + 0.01;
    if (Number.isFinite(e1rm)) bestE1rm = Math.max(bestE1rm, e1rm);

    if (Number.isFinite(e1rm)) {
      scoreSeries.push({
        date: record.date,
        label: shortDateFmt.format(record.date),
        value: e1rm,
        metric: "e1rm",
        mainSet,
        isPr,
        record
      });
    }
    if (mainSet && Number.isFinite(mainSet.weightKg) && Number.isFinite(mainSet.reps)) {
      repSeries.push({
        date: record.date,
        label: shortDateFmt.format(record.date),
        value: mainSet.reps,
        metric: "reps",
        e1rm,
        isPr,
        mainSet,
        record
      });
      weightSeries.push({
        date: record.date,
        label: shortDateFmt.format(record.date),
        value: mainSet.weightKg,
        metric: "topWeight",
        e1rm,
        mainSet,
        isPr,
        record
      });
    }
  });

  els.trendTitle.textContent = state.exercise || "種目推移";
  els.trendStat.innerHTML = buildThreeLayerStat(scoreSeries, repSeries, weightSeries);

  const color = BODY_COLORS[records[0]?.body] || "#3b6ea8";
  const timeDomain = getTimeDomain(records.map((record) => record.date));
  drawLineChart(els.scoreCanvas, scoreSeries, {
    metric: "e1rm",
    color,
    label: "推定1RM",
    pointKey: "score",
    timeDomain
  });
  drawLineChart(els.bubbleCanvas, repSeries, {
    metric: "reps",
    color,
    label: "メインセット回数",
    pointKey: "mainReps",
    timeDomain
  });
  drawLineChart(els.repsCanvas, weightSeries, {
    metric: "topWeight",
    color,
    label: "メインセット重量",
    pointKey: "mainWeight",
    timeDomain
  });
}

function renderWeekly(workouts) {
  const buckets = new Map();
  workouts.forEach((workout) => {
    const week = startOfWeek(workout.date);
    const key = week.toISOString().slice(0, 10);
    const item = buckets.get(key) || {
      week,
      label: `${week.getMonth() + 1}/${week.getDate()}週`,
      volumeKg: 0,
      sessions: 0,
      sets: 0,
      cardioMin: 0
    };
    item.volumeKg += workout.metrics.volumeKg;
    item.sessions += workout.metrics.strengthExerciseCount > 0 ? 1 : 0;
    item.sets += workout.metrics.sets;
    item.cardioMin += workout.metrics.cardioSeconds / 60;
    buckets.set(key, item);
  });
  const data = [...buckets.values()].sort((a, b) => a.week - b.week);
  drawWeeklyChart(els.weeklyCanvas, data.slice(-14));
}

function renderInsights(workouts) {
  const stats = buildExerciseStats(workouts).filter((stat) => stat.type === "strength");
  const bodyStats = getBodyStats(workouts);
  const bestImprovement = stats
    .map((stat) => ({ stat, delta: getLatestDelta(stat, "bestE1rmKg") }))
    .filter((item) => Number.isFinite(item.delta))
    .sort((a, b) => b.delta - a.delta)[0];
  const leader = bodyStats.sort((a, b) => b.volumeKg - a.volumeKg)[0];
  const pr = findRecentPr(workouts);
  const frequency = workouts.length ? workouts.filter((w) => w.metrics.strengthExerciseCount > 0).length / Math.max(1, getSpanDays(workouts) / 7) : 0;

  const cards = [];
  if (bestImprovement && bestImprovement.delta > 0) {
    cards.push({
      title: `伸び幅: ${truncate(bestImprovement.stat.name, 24)}`,
      text: `初回から最新で推定1RMが ${formatKg(bestImprovement.delta)} 上昇。${bestImprovement.stat.body} の主力候補です。`,
      color: "#2f7d64"
    });
  }
  if (leader) {
    cards.push({
      title: `量が多い部位: ${leader.body}`,
      text: `${formatTon(leader.volumeKg)}、${numberFmt.format(leader.sets)}セット。直近の配分で最も比重が高い部位です。`,
      color: BODY_COLORS[leader.body] || "#3b6ea8"
    });
  }
  if (pr) {
    cards.push({
      title: `直近PR: ${truncate(pr.exercise.name, 24)}`,
      text: `${dateFmt.format(pr.workout.date)} に ${formatMetricValue(pr.value, pr.exercise.loadMode === "assist" ? "topWeight" : "e1rm")}。`,
      color: "#ba4a4a"
    });
  }
  cards.push({
    title: `頻度: 週 ${decimalFmt.format(frequency)} 回`,
    text: `${getDateRangeLabel(workouts).sub} の筋トレ頻度。部位選択で期間内の偏りを確認できます。`,
    color: "#3b6ea8"
  });

  els.insights.innerHTML = cards
    .slice(0, 4)
    .map(
      (card) => `
        <div class="insight-card" style="border-left-color:${card.color}">
          <strong>${escapeHtml(card.title)}</strong>
          <span>${escapeHtml(card.text)}</span>
        </div>
      `
    )
    .join("");
}

function renderExerciseTable(workouts) {
  const query = state.search.trim().toLowerCase();
  const rows = buildExerciseStats(workouts).filter((stat) => !query || stat.name.toLowerCase().includes(query));

  if (!rows.length) {
    els.exerciseTable.innerHTML = `<tr><td colspan="10" class="empty-state">該当する種目がありません</td></tr>`;
    return;
  }

  els.exerciseTable.innerHTML = rows
    .map((stat) => {
      const delta = getLatestDelta(stat, stat.loadMode === "assist" ? "topWeightKg" : "bestE1rmKg");
      return `
        <tr>
          <td><div class="exercise-name" title="${escapeAttr(stat.name)}">${escapeHtml(stat.name)}</div></td>
          <td><span class="tag" style="background:${tint(BODY_COLORS[stat.body])}; color:${BODY_COLORS[stat.body]}">${escapeHtml(stat.body)}</span></td>
          <td>${getMuscleDetailMarkup(stat.name, stat.body) || "—"}</td>
          <td>${numberFmt.format(stat.sessions)}</td>
          <td>${numberFmt.format(stat.sets)}</td>
          <td>${stat.type === "strength" ? formatTon(stat.volumeKg) : formatDistance(stat.distanceM)}</td>
          <td>${stat.topWeightKg ? `${stat.loadMode === "assist" ? "補助 " : ""}${formatKg(stat.topWeightKg)}` : "—"}</td>
          <td>${stat.bestE1rmKg ? formatKg(stat.bestE1rmKg) : stat.loadMode === "assist" ? "補助種目" : "—"}</td>
          <td>${formatDelta(delta, stat.loadMode === "assist" ? "topWeight" : "e1rm")}</td>
          <td>${stat.latest ? dateFmt.format(stat.latest.date) : "—"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderTimeline(workouts) {
  const display = workouts
    .filter((workout) => (state.body === "all" ? true : workout.exercises.some((exercise) => exercise.body === state.body)))
    .slice()
    .sort((a, b) => b.date - a.date)
    .slice(0, 24);

  if (!display.length) {
    els.timeline.innerHTML = `<div class="empty-state">該当するワークアウトがありません</div>`;
    return;
  }

  els.timeline.innerHTML = display
    .map((workout) => {
      const exercises = workout.exercises.filter((exercise) => state.body === "all" || exercise.body === state.body);
      const visibleExercises = exercises.slice(0, 7);
      const extra = exercises.length - visibleExercises.length;
      const newBadges = workout.annotations.newExercises.filter((name) => exercises.some((exercise) => exercise.name === name));
      const prBadges = workout.annotations.prs.filter((name) => exercises.some((exercise) => exercise.name === name));
      return `
        <article class="workout-card">
          <div class="workout-top">
            <div>
              <div class="workout-date">${escapeHtml(dateFmt.format(workout.date))}</div>
              <div class="workout-name">${escapeHtml(workout.name || "Workout")}</div>
            </div>
            <div class="workout-volume">
              ${formatTon(workout.metrics.volumeKg)}
              <div class="body-meta">${numberFmt.format(workout.totalTimeMin)}分</div>
            </div>
          </div>
          <div class="exercise-chip-list">
            ${visibleExercises
              .map(
                (exercise) =>
                  `<span class="exercise-chip" style="border-color:${tint(BODY_COLORS[exercise.body])};">${escapeHtml(truncate(exercise.name, 28))}</span>`
              )
              .join("")}
            ${extra > 0 ? `<span class="exercise-chip">+${extra}</span>` : ""}
          </div>
          <div class="badge-row">
            ${newBadges.slice(0, 2).map((name) => `<span class="badge new">新規 ${escapeHtml(truncate(name, 14))}</span>`).join("")}
            ${prBadges.slice(0, 2).map((name) => `<span class="badge pr">PR ${escapeHtml(truncate(name, 14))}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function drawLineChart(canvas, series, options) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 58, right: 24, top: 22, bottom: 40 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  if (!series.length) {
    drawEmptyChart(ctx, width, height, "表示できるデータがありません");
    state.chartPoints[options.pointKey || "work"] = [];
    state.trendPoints = [];
    return;
  }

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const yMin = Math.max(0, min - (max - min || max || 1) * 0.18);
  const yMax = max + (max - yMin || 1) * 0.18;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const timeDomain = options.timeDomain || getTimeDomain(series.map((point) => point.date));
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;
  const yFor = (value) => pad.top + plotH - ((value - yMin) / (yMax - yMin || 1)) * plotH;

  drawGrid(ctx, width, height, pad, yMin, yMax, options.metric);
  drawMonthAxis(ctx, width, height, pad, timeDomain);

  const points = series.map((point) => ({
    x: xFor(point.date),
    y: yFor(point.value),
    kind: options.pointKey || "work",
    point
  }));

  ctx.strokeStyle = options.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = point.point.isPr ? "#fff7ed" : "#fff";
    ctx.arc(point.x, point.y, point.point.isPr ? 6 : 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = point.point.isPr ? 3 : 2;
    ctx.strokeStyle = point.point.isPr ? "#ba4a4a" : options.color;
    ctx.stroke();
  });

  state.chartPoints[options.pointKey || "work"] = points;
  state.trendPoints = points;
}

function drawRepWeightChart(canvas, series, options) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 58, right: 24, top: 26, bottom: 40 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  const valid = series
    .filter((point) => Number.isFinite(point.weightKg) && Number.isFinite(point.reps))
    .sort((a, b) => a.date - b.date);

  if (!valid.length) {
    drawEmptyChart(ctx, width, height, "表示できるデータがありません");
    state.chartPoints[options.pointKey || "bubble"] = [];
    return;
  }

  const minRep = Math.max(1, Math.min(...valid.map((point) => Math.floor(point.reps))));
  const maxRep = Math.max(...valid.map((point) => Math.floor(point.reps)));
  const repRange = [];
  for (let rep = minRep; rep <= maxRep; rep += 1) repRange.push(rep);

  const lineSeries = dedupeDominatedLines(
    repRange.map((repCount) => {
      let bestWeight = null;
      return {
        repCount,
        points: valid
          .filter((source) => source.reps >= repCount)
          .map((source) => {
            let updated = false;
            if (bestWeight === null || source.weightKg > bestWeight + 0.001) {
              bestWeight = source.weightKg;
              updated = true;
            }
            return {
              date: source.date,
              value: bestWeight,
              repCount,
              updated,
              source,
              record: source.record,
              mainSet: source.mainSet,
              isPr: source.isPr
            };
          })
          .filter(Boolean)
      };
    }).filter((line) => line.points.length),
    (line) => line.repCount
  );

  const visibleLines = selectReadableLines(lineSeries, (line) => line.repCount, 4);
  const visibleSet = new Set(visibleLines);
  const allValues = visibleLines.flatMap((line) => line.points.map((point) => point.value));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const yMin = Math.max(0, min - (max - min || max || 1) * 0.18);
  const yMax = max + (max - yMin || 1) * 0.18;
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const timeDomain = options.timeDomain || getTimeDomain(valid.map((point) => point.date));
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;
  const yFor = (value) => pad.top + plotH - ((value - yMin) / (yMax - yMin || 1)) * plotH;
  const palette = ["#ba4a4a", "#3b6ea8", "#2f7d64", "#b7791f", "#7357a4", "#1f7a83", "#57606a"];
  const tooltipPoints = [];
  const labelSlots = [];

  drawGrid(ctx, width, height, pad, yMin, yMax, "topWeight");
  drawMonthAxis(ctx, width, height, pad, timeDomain);

  lineSeries.forEach((line, lineIndex) => {
    const color = palette[lineIndex % palette.length];
    const isVisible = visibleSet.has(line);
    if (!isVisible) return;
    const isFrontier = line.repCount === maxRep;
    const points = line.points.map((point) => ({
      ...point,
      x: xFor(point.date),
      y: yFor(point.value),
      kind: options.pointKey || "bubble"
    }));

    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = isFrontier ? 0.96 : 0.58;
    ctx.lineWidth = isFrontier ? 2.6 : isVisible ? 1.6 : 1;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const previous = points[index - 1];
        ctx.lineTo(point.x, previous.y);
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.restore();

    points
      .filter((point) => point.updated)
      .forEach((point) => {
        if (isVisible || point.isPr) {
          ctx.beginPath();
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = point.isPr ? "#ba4a4a" : color;
          ctx.lineWidth = point.isPr ? 2.8 : 1.7;
          ctx.arc(point.x, point.y, point.isPr ? 4.8 : 3.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        tooltipPoints.push(point);
      });

    const last = points[points.length - 1];
    if (last && isVisible) {
      const labelY = reserveLabelY(last.y, labelSlots, pad.top + 10, height - pad.bottom - 10);
      const labelX = Math.min(width - pad.right - 2, last.x + 8);
      ctx.fillStyle = color;
      ctx.font = isFrontier ? "700 11px system-ui, sans-serif" : "11px system-ui, sans-serif";
      ctx.textAlign = labelX > width - pad.right - 52 ? "right" : "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`${line.repCount}回`, labelX, labelY);
    }
  });

  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`${minRep}〜${maxRep}回で達成した最高重量 / 代表線のみ`, pad.left, 8);

  state.chartPoints[options.pointKey || "bubble"] = tooltipPoints;
}

function drawWeightRepsChart(canvas, series, options) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 58, right: 24, top: 26, bottom: 40 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  const valid = series
    .filter((point) => Number.isFinite(point.weightKg) && Number.isFinite(point.reps))
    .sort((a, b) => a.date - b.date);

  if (!valid.length) {
    drawEmptyChart(ctx, width, height, "表示できるデータがありません");
    state.chartPoints[options.pointKey || "reps"] = [];
    return;
  }

  const weightValues = [...new Set(valid.map((point) => normalizeWeight(point.weightKg)))]
    .sort((a, b) => a - b);
  const lineSeries = dedupeDominatedLines(
    weightValues.map((weightKg) => {
      let bestReps = null;
      return {
        weightKg,
        points: valid
          .filter((source) => Math.abs(normalizeWeight(source.weightKg) - weightKg) < 0.001)
          .map((source) => {
            let updated = false;
            if (bestReps === null || source.reps > bestReps + 0.001) {
              bestReps = source.reps;
              updated = true;
            }
            return {
              date: source.date,
              value: bestReps,
              weightKg,
              updated,
              source,
              record: source.record,
              mainSet: source.mainSet,
              isPr: source.isPr
            };
          })
          .filter(Boolean)
      };
    }).filter((line) => line.points.length),
    (line) => line.weightKg
  );

  const visibleLines = selectReadableLines(lineSeries, (line) => line.weightKg, 4);
  const visibleSet = new Set(visibleLines);
  const allValues = visibleLines.flatMap((line) => line.points.map((point) => point.value));
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const yMin = Math.max(0, min - Math.max(1, (max - min || max || 1) * 0.18));
  const yMax = max + Math.max(1, (max - yMin || 1) * 0.18);
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const timeDomain = options.timeDomain || getTimeDomain(valid.map((point) => point.date));
  const xFor = (date) => pad.left + normalizedTimePosition(date, timeDomain) * plotW;
  const yFor = (value) => pad.top + plotH - ((value - yMin) / (yMax - yMin || 1)) * plotH;
  const palette = ["#ba4a4a", "#3b6ea8", "#2f7d64", "#b7791f", "#7357a4", "#1f7a83", "#57606a"];
  const tooltipPoints = [];
  const labelSlots = [];

  drawGrid(ctx, width, height, pad, yMin, yMax, "reps");
  drawMonthAxis(ctx, width, height, pad, timeDomain);

  lineSeries.forEach((line, lineIndex) => {
    const color = palette[lineIndex % palette.length];
    const isVisible = visibleSet.has(line);
    if (!isVisible) return;
    const isFrontier = line.weightKg === weightValues[weightValues.length - 1];
    const points = line.points.map((point) => ({
      ...point,
      x: xFor(point.date),
      y: yFor(point.value),
      kind: options.pointKey || "reps"
    }));

    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = isFrontier ? 0.96 : 0.58;
    ctx.lineWidth = isFrontier ? 2.6 : isVisible ? 1.6 : 1;
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        const previous = points[index - 1];
        ctx.lineTo(point.x, previous.y);
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();
    ctx.restore();

    points
      .filter((point) => point.updated)
      .forEach((point) => {
        if (isVisible || point.isPr) {
          ctx.beginPath();
          ctx.fillStyle = "#fff";
          ctx.strokeStyle = point.isPr ? "#ba4a4a" : color;
          ctx.lineWidth = point.isPr ? 2.8 : 1.7;
          ctx.arc(point.x, point.y, point.isPr ? 4.8 : 3.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        tooltipPoints.push(point);
      });

    const last = points[points.length - 1];
    if (last && isVisible) {
      const labelY = reserveLabelY(last.y, labelSlots, pad.top + 10, height - pad.bottom - 10);
      const labelX = Math.min(width - pad.right - 2, last.x + 8);
      ctx.fillStyle = color;
      ctx.font = isFrontier ? "700 11px system-ui, sans-serif" : "11px system-ui, sans-serif";
      ctx.textAlign = labelX > width - pad.right - 54 ? "right" : "left";
      ctx.textBaseline = "middle";
      ctx.fillText(formatKg(line.weightKg), labelX, labelY);
    }
  });

  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("各重量で達成した最高回数 / 代表線のみ", pad.left, 8);

  state.chartPoints[options.pointKey || "reps"] = tooltipPoints;
}

function drawWeeklyChart(canvas, data) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 48, right: 24, top: 24, bottom: 42 };
  ctx.clearRect(0, 0, width, height);
  drawPanelBackground(ctx, width, height);

  if (!data.length) {
    drawEmptyChart(ctx, width, height, "週次データがありません");
    return;
  }

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const maxVolume = Math.max(1, ...data.map((d) => d.volumeKg));
  const barW = Math.max(8, plotW / data.length - 12);

  ctx.strokeStyle = "#dce4e9";
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 3; i += 1) {
    const y = pad.top + (plotH * i) / 3;
    const value = maxVolume - (maxVolume * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatTon(value), pad.left - 8, y);
  }

  data.forEach((item, index) => {
    const x = pad.left + (plotW * (index + 0.5)) / data.length;
    const barH = (item.volumeKg / maxVolume) * plotH;
    ctx.fillStyle = "#3b6ea8";
    ctx.fillRect(x - barW / 2, pad.top + plotH - barH, barW, barH);
    ctx.fillStyle = "#17202a";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.font = "700 12px system-ui, sans-serif";
    if (item.sessions) ctx.fillText(`${item.sessions}回`, x, pad.top + plotH - barH - 4);
    ctx.fillStyle = "#64717c";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textBaseline = "top";
    if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
      ctx.fillText(item.label, x, height - pad.bottom + 16);
    }
  });
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(320, rect.width);
  const height = Math.max(220, rect.height);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function drawPanelBackground(ctx, width, height) {
  ctx.fillStyle = "#fbfcfd";
  ctx.fillRect(0, 0, width, height);
}

function drawGrid(ctx, width, height, pad, yMin, yMax, metric) {
  const plotH = height - pad.top - pad.bottom;
  ctx.strokeStyle = "#dce4e9";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 3; i += 1) {
    const y = pad.top + (plotH * i) / 3;
    const value = yMax - ((yMax - yMin) * i) / 3;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText(formatMetricValue(value, metric), pad.left - 8, y);
  }
}

function drawMonthAxis(ctx, width, height, pad, timeDomain) {
  const plotBottom = height - pad.bottom;
  const start = new Date(timeDomain.min);
  start.setHours(0, 0, 0, 0);
  start.setDate(1);

  if (start.getTime() < timeDomain.min) {
    start.setMonth(start.getMonth() + 1);
  }

  const monthTicks = [];
  const cursor = new Date(start);
  while (cursor.getTime() <= timeDomain.max) {
    monthTicks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const plotW = width - pad.left - pad.right;
  const xForTime = (time) => pad.left + ((time - timeDomain.min) / (timeDomain.max - timeDomain.min || 1)) * plotW;

  ctx.save();
  ctx.strokeStyle = "rgba(112, 124, 135, 0.18)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#64717c";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  monthTicks.forEach((tick) => {
    const x = xForTime(tick.getTime());
    if (x < pad.left - 1 || x > width - pad.right + 1) return;
    ctx.beginPath();
    ctx.moveTo(x, pad.top);
    ctx.lineTo(x, plotBottom);
    ctx.stroke();
    ctx.fillText(`${tick.getMonth() + 1}月`, Math.min(width - pad.right, Math.max(pad.left, x)), plotBottom + 15);
  });

  if (!monthTicks.length) {
    const midpoint = new Date((timeDomain.min + timeDomain.max) / 2);
    ctx.fillText(`${midpoint.getMonth() + 1}月`, pad.left + plotW / 2, plotBottom + 15);
  }
  ctx.restore();
}

function getTimeDomain(dates) {
  const times = dates.map((date) => date?.getTime?.()).filter((time) => Number.isFinite(time));
  if (!times.length) return { min: 0, max: 1 };
  const min = Math.min(...times);
  const max = Math.max(...times);
  if (min === max) return { min: min - 86400000, max: max + 86400000 };
  const padding = Math.max(86400000, (max - min) * 0.04);
  return { min: min - padding, max: max + padding };
}

function normalizedTimePosition(date, domain) {
  const time = date?.getTime?.();
  if (!Number.isFinite(time)) return 0;
  return (time - domain.min) / (domain.max - domain.min || 1);
}

function drawEmptyChart(ctx, width, height, text) {
  ctx.fillStyle = "#66737f";
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, width / 2, height / 2);
}

function getMetricValue(record, metric) {
  if (metric === "mainWork") return record.metrics.mainWorkKg;
  if (metric === "volume") return record.metrics.volumeKg;
  if (metric === "topWeight") return record.metrics.topWeightKg;
  if (metric === "e1rm") return record.metrics.bestE1rmKg;
  if (metric === "reps") return record.metrics.reps;
  if (metric === "sets") return record.metrics.sets;
  return null;
}

function buildTrendStat(series, metric) {
  if (!series.length) return `<strong>—</strong><span>${escapeHtml(METRIC_LABELS[metric])}</span>`;
  const first = series[0].value;
  const latest = series[series.length - 1].value;
  const best = Math.max(...series.map((point) => point.value));
  const delta = latest - first;
  return `
    <strong>${formatMetricValue(latest, metric)}</strong>
    <span>${series.length}回 / PR ${formatMetricValue(best, metric)} / ${formatDelta(delta, metric)}</span>
  `;
}

function buildThreeLayerStat(scoreSeries, repSeries, weightSeries) {
  if (!scoreSeries.length && !repSeries.length && !weightSeries.length) return `<strong>—</strong><span>データなし</span>`;
  const score = scoreSeries[scoreSeries.length - 1];
  const scoreFirst = scoreSeries[0];
  const scoreBest = scoreSeries.length ? Math.max(...scoreSeries.map((point) => point.value)) : null;
  const reps = repSeries[repSeries.length - 1];
  const weight = weightSeries[weightSeries.length - 1];
  const scoreDelta = score && scoreFirst ? score.value - scoreFirst.value : null;
  return `
    <strong>${score ? formatKg(score.value) : "—"}</strong>
    <span>推定1RM PR ${formatKg(scoreBest)} / ${formatDelta(scoreDelta, "e1rm")} / 最新 ${reps ? numberFmt.format(reps.value) : "—"}回 ${weight ? formatKg(weight.value) : "—"}</span>
  `;
}

function buildTrendTooltip(point) {
  const data = point.point;
  const record = data.record;
  const mainSet = data.mainSet;
  const lines = [`<strong>${escapeHtml(dateFmt.format(record.date))}</strong>`];

  if (point.kind === "mainReps") {
    lines.push(`メインセット回数: ${escapeHtml(numberFmt.format(data.value))}回${data.isPr ? " / 推定1RM更新" : ""}`);
    if (mainSet) {
      lines.push(`<span>${escapeHtml(numberFmt.format(mainSet.reps))}回 x ${escapeHtml(decimalFmt.format(mainSet.weightKg))}kg</span>`);
    }
  } else if (point.kind === "mainWeight") {
    lines.push(`メインセット重量: ${escapeHtml(formatKg(data.value))}${data.isPr ? " / 推定1RM更新" : ""}`);
    if (mainSet) {
      lines.push(`<span>${escapeHtml(numberFmt.format(mainSet.reps))}回 x ${escapeHtml(decimalFmt.format(mainSet.weightKg))}kg</span>`);
    }
  } else if (point.kind === "bubble") {
    lines.push(`${escapeHtml(numberFmt.format(data.repCount))}回ライン: ${escapeHtml(formatKg(data.value))}${data.updated ? " 更新" : ""}`);
    if (data.source) {
      lines.push(`<span>メインセット ${escapeHtml(numberFmt.format(data.source.reps))}回 x ${escapeHtml(decimalFmt.format(data.source.weightKg))}kg</span>`);
    }
    if (data.isPr) lines.push("推定1RMも更新");
  } else if (point.kind === "reps") {
    lines.push(`${escapeHtml(formatKg(data.weightKg))}ライン: ${escapeHtml(numberFmt.format(data.value))}回${data.updated ? " 更新" : ""}`);
    if (data.source) {
      lines.push(`<span>メインセット ${escapeHtml(numberFmt.format(data.source.reps))}回 x ${escapeHtml(decimalFmt.format(data.source.weightKg))}kg</span>`);
    }
    if (data.isPr) lines.push("推定1RMも更新");
  } else {
    lines.push(`${escapeHtml(formatMetricValue(data.value, data.metric || state.metric))}${data.isPr ? " / PR" : ""}`);
    if (mainSet) {
      lines.push(`<span>${escapeHtml(mainSet.reps)}回 x ${escapeHtml(decimalFmt.format(mainSet.weightKg))}kg = ${escapeHtml(formatWork(mainSet.volumeKg))}</span>`);
    }
  }
  return lines.join("<br>");
}

function getBodyStats(workouts) {
  const map = new Map();
  flattenExercises(workouts)
    .filter((record) => record.type === "strength")
    .forEach((record) => {
      const item = map.get(record.body) || { body: record.body, volumeKg: 0, sets: 0, sessions: new Set() };
      item.volumeKg += record.metrics.volumeKg;
      item.sets += record.metrics.sets;
      item.sessions.add(record.workout.id);
      map.set(record.body, item);
    });
  return [...map.values()];
}

function getLatestDelta(stat, metricKey) {
  if (!stat.first || !stat.latest || stat.first === stat.latest) return null;
  const first = stat.first.metrics[metricKey];
  const latest = stat.latest.metrics[metricKey];
  if (!Number.isFinite(first) || !Number.isFinite(latest)) return null;
  return latest - first;
}

function findRecentPr(workouts) {
  const sorted = workouts.slice().sort((a, b) => b.date - a.date);
  for (const workout of sorted) {
    for (const name of workout.annotations.prs) {
      const exercise = workout.exercises.find((item) => item.name === name);
      if (exercise) {
        return {
          workout,
          exercise,
          value: exercise.metrics.bestE1rmKg || exercise.metrics.topWeightKg
        };
      }
    }
  }
  return null;
}

function countBy(items, key) {
  const map = new Map();
  items.forEach((item) => map.set(item[key], (map.get(item[key]) || 0) + 1));
  return map;
}

function getDateRangeLabel(workouts) {
  if (!workouts.length) return { value: "0日", sub: "データなし" };
  const sorted = workouts.slice().sort((a, b) => a.date - b.date);
  const days = getSpanDays(workouts);
  return {
    value: `${numberFmt.format(days)}日`,
    sub: `${dateFmt.format(sorted[0].date)} - ${dateFmt.format(sorted[sorted.length - 1].date)}`
  };
}

function getSpanDays(workouts) {
  if (!workouts.length) return 0;
  const times = workouts.map((workout) => workout.date.getTime());
  return Math.max(1, Math.round((Math.max(...times) - Math.min(...times)) / 86400000) + 1);
}

function startOfWeek(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  return copy;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function localDateKey(date) {
  const copy = startOfDay(date);
  const year = copy.getFullYear();
  const month = String(copy.getMonth() + 1).padStart(2, "0");
  const day = String(copy.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTon(value) {
  if (!Number.isFinite(value)) return "—";
  return `${decimalFmt.format(value / 1000)}t`;
}

function formatKg(value) {
  if (!Number.isFinite(value)) return "—";
  return `${decimalFmt.format(value)}kg`;
}

function formatWork(value) {
  if (!Number.isFinite(value)) return "—";
  return `${numberFmt.format(value)}kg・rep`;
}

function normalizeWeight(value) {
  return Math.round(value * 100) / 100;
}

function dedupeDominatedLines(lines, strengthSelector) {
  const bySignature = new Map();
  lines.forEach((line) => {
    const signature = line.points
      .map((point) => `${point.date.getTime()}:${Math.round(point.value * 1000) / 1000}`)
      .join("|");
    const existing = bySignature.get(signature);
    if (!existing || strengthSelector(line) > strengthSelector(existing)) {
      bySignature.set(signature, line);
    }
  });
  return [...bySignature.values()].sort((a, b) => strengthSelector(a) - strengthSelector(b));
}

function selectReadableLines(lines, selector, maxCount = 5) {
  if (lines.length <= maxCount) return lines;
  const sorted = lines.slice().sort((a, b) => selector(a) - selector(b));
  const selected = new Set([sorted[0], sorted[sorted.length - 1]]);
  const slots = maxCount - selected.size;
  for (let index = 1; index <= slots; index += 1) {
    const position = Math.round((index * (sorted.length - 1)) / (slots + 1));
    selected.add(sorted[position]);
  }
  return sorted.filter((line) => selected.has(line));
}

function reserveLabelY(targetY, slots, minY, maxY) {
  const spacing = 16;
  let y = Math.min(maxY, Math.max(minY, targetY));
  while (slots.some((used) => Math.abs(used - y) < spacing)) {
    y += spacing;
    if (y > maxY) y = Math.max(minY, targetY - spacing);
    if (slots.some((used) => Math.abs(used - y) < spacing)) break;
  }
  slots.push(y);
  return y;
}

function formatDistance(value) {
  if (!Number.isFinite(value) || value === 0) return "—";
  return `${decimalFmt.format(value / 1000)}km`;
}

function formatMetricValue(value, metric) {
  if (!Number.isFinite(value)) return "—";
  if (metric === "mainWork") return formatWork(value);
  if (metric === "reps") return `${numberFmt.format(value)}回`;
  if (metric === "volume") return formatTon(value);
  if (metric === "topWeight" || metric === "e1rm") return formatKg(value);
  return numberFmt.format(value);
}

function formatInBodyNumber(value) {
  return Number.isFinite(value) ? decimalFmt.format(value) : "—";
}

function formatInBodyValue(value, metricKey) {
  if (!Number.isFinite(value)) return "—";
  const metric = INBODY_METRICS[metricKey];
  return `${decimalFmt.format(value)}${metric?.unit || ""}`;
}

function formatInBodyDelta(value, metricKey) {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatInBodyValue(value, metricKey)}`;
}

function formatDelta(value, metric) {
  if (!Number.isFinite(value)) return "—";
  const cls = value >= 0 ? "delta-pos" : "delta-neg";
  const sign = value > 0 ? "+" : "";
  return `<span class="${cls}">${sign}${formatMetricValue(value, metric)}</span>`;
}

function truncate(value, maxLength) {
  if (!value || value.length <= maxLength) return value || "";
  return `${value.slice(0, maxLength - 1)}…`;
}

function tint(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

async function loadSample() {
  const savedInBodyText = readStorage(STORED_INBODY_CSV_KEY);
  const savedInBodyName = readStorage(STORED_INBODY_CSV_NAME_KEY);
  if (savedInBodyText) {
    loadInBodyCsv(savedInBodyText, savedInBodyName || "保存済みInBody CSV", { persist: false, shouldRender: false });
  }

  const savedText = readStorage(STORED_CSV_KEY);
  const savedName = readStorage(STORED_CSV_NAME_KEY);
  if (savedText) {
    loadCsv(savedText, savedName || "保存済みCSV", { persist: false });
    return;
  }

  const response = await fetch(DEFAULT_CSV_PATH);
  if (!response.ok) throw new Error(`${DEFAULT_CSV_PATH} not found`);
  const text = await response.text();
  loadCsv(text, DEFAULT_CSV_NAME, { persist: false });
}

function loadCsv(text, fileName, options = {}) {
  const workouts = parseAdvagymCsv(text);
  state.workouts = workouts;
  state.fileName = fileName;
  state.range = "all";
  state.body = "all";
  state.exercise = "";
  state.metric = "mainWork";
  state.search = "";
  els.rangeSelect.value = state.range;
  els.searchInput.value = "";
  if (options.persist) {
    writeStorage(STORED_CSV_KEY, text);
    writeStorage(STORED_CSV_NAME_KEY, fileName);
  }
  renderAll();
}

function loadInBodyCsv(text, fileName, options = {}) {
  const records = parseInBodyCsv(text);
  state.inbodyRecords = records;
  state.inbodyFileName = fileName;
  state.inbodyError = records.length ? "" : "日付・体重・骨格筋量・体脂肪率の列を見つけられませんでした";
  state.inbodyRange = DEFAULT_INBODY_RANGE;
  state.inbodyMetric = state.inbodyMetric || "weight";
  els.inbodyRangeSelect.value = state.inbodyRange;
  if (options.persist) {
    writeStorage(STORED_INBODY_CSV_KEY, text);
    writeStorage(STORED_INBODY_CSV_NAME_KEY, fileName);
  }
  if (options.shouldRender !== false) {
    renderAll();
    setPage("inbody");
  }
}

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // The app can still work for the current session if browser storage is unavailable.
  }
}

function handleFile(file) {
  if (!file) return;
  readFileText(file, scoreWorkoutCsvText, (text) => loadCsv(text, file.name, { persist: true }));
}

function handleInBodyFile(file) {
  if (!file) return;
  state.inbodyFileName = `${file.name} 読み込み中`;
  state.inbodyError = "";
  renderInBody();
  readFileText(file, scoreInBodyCsvText, (text) => loadInBodyCsv(text, file.name, { persist: true }));
}

function readFileText(file, scoreText, onLoad) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = reader.result;
    const text =
      result instanceof ArrayBuffer
        ? decodeBestText(result, scoreText)
        : String(result || "");
    onLoad(text);
  });
  reader.addEventListener("error", () => {
    if (scoreText === scoreInBodyCsvText) {
      state.inbodyFileName = file.name;
      state.inbodyError = "CSVファイルを読み込めませんでした";
      renderInBody();
    }
  });
  reader.readAsArrayBuffer(file);
}

function decodeBestText(buffer, scoreText) {
  const bytes = new Uint8Array(buffer);
  const bomEncoding =
    bytes[0] === 0xff && bytes[1] === 0xfe
      ? "utf-16le"
      : bytes[0] === 0xfe && bytes[1] === 0xff
      ? "utf-16be"
      : bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf
      ? "utf-8"
      : "";
  const encodings = [...new Set([bomEncoding, "utf-8", "shift_jis", "utf-16le", "utf-16be"].filter(Boolean))];
  const candidates = encodings.map((encoding) => {
    let text = "";
    try {
      text = new TextDecoder(encoding).decode(bytes);
    } catch {
      text = "";
    }
    const replacementPenalty = (text.match(/\uFFFD/g) || []).length * 30;
    const nulPenalty = (text.match(/\u0000/g) || []).length * 10;
    return {
      encoding,
      text,
      score: scoreText(text) - replacementPenalty - nulPenalty
    };
  });
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.text || "";
}

function scoreWorkoutCsvText(text) {
  let score = 0;
  if (/Workout date/.test(text)) score += 50;
  if (/Exercise name/.test(text)) score += 30;
  if (/Weight \(kg\)/.test(text)) score += 20;
  return score + Math.min(20, (text.match(/;/g) || []).length);
}

function scoreInBodyCsvText(text) {
  const parsed = parseInBodyCsv(text);
  if (parsed.length) return 100 + parsed.length * 10;
  const rows = parseCsvRows(text).slice(0, 30);
  const headerScore = rows.reduce((best, row) => {
    const columns = detectInBodyColumns(row);
    const metricCount = INBODY_METRIC_KEYS.filter((key) => isColumnIndex(columns[key])).length;
    const segmentCount = INBODY_SEGMENT_KEYS.filter((key) => isColumnIndex(columns[key])).length;
    return Math.max(best, (isColumnIndex(columns.date) ? 2 : 0) + metricCount + segmentCount);
  }, 0);
  const keywordScore = [/体重/, /骨格筋/, /体脂肪率/, /右腕筋肉量/, /体幹筋肉量/, /Weight/i, /Skeletal/i, /Percent Body Fat/i, /\bPBF\b/i].reduce(
    (total, pattern) => total + (pattern.test(text) ? 5 : 0),
    0
  );
  return headerScore * 10 + keywordScore;
}

function setPage(page) {
  if (!["training", "inbody"].includes(page)) return;
  state.page = page;
  renderPageState();
  requestAnimationFrame(() => renderAll());
}

function renderPageState() {
  const index = state.page === "inbody" ? 1 : 0;
  const offset = els.pageViewport.clientWidth * index;
  els.pageTrack.style.transform = `translateX(-${offset}px)`;
  els.pageTabs.forEach((button) => {
    const active = button.dataset.page === state.page;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  els.backToBodyButton.hidden = state.page !== "training";
}

function selectExercise(name, shouldScroll = false) {
  state.exercise = name;
  renderAll();
  if (shouldScroll && els.trendPanel) {
    requestAnimationFrame(() => els.trendPanel.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
}

els.fileButton.addEventListener("click", () => els.csvInput.click());
els.csvInput.addEventListener("change", (event) => handleFile(event.target.files[0]));
els.inbodyFileButton.addEventListener("click", () => els.inbodyCsvInput.click());
els.inbodyCsvInput.addEventListener("change", (event) => handleInBodyFile(event.target.files[0]));
els.pageTabs.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});
els.rangeSelect.addEventListener("change", (event) => {
  state.range = event.target.value;
  renderAll();
});
els.inbodyRangeSelect.addEventListener("change", (event) => {
  state.inbodyRange = event.target.value;
  renderInBody();
});
els.bodySelect.addEventListener("change", (event) => {
  state.body = event.target.value;
  state.exercise = "";
  renderAll();
});
els.exerciseSelect.addEventListener("change", (event) => {
  selectExercise(event.target.value);
});
els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderExerciseTable(getRangeWorkouts());
});

els.bodyTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-body]");
  if (!button) return;
  state.body = button.dataset.body;
  state.exercise = "";
  renderAll();
});

els.exerciseCards.addEventListener("click", (event) => {
  const button = event.target.closest("[data-exercise]");
  if (!button) return;
  selectExercise(button.dataset.exercise, true);
});

els.inbodyMetricTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-inbody-metric]");
  if (!button) return;
  state.inbodyMetric = button.dataset.inbodyMetric;
  renderInBody();
});

els.backToBodyButton.addEventListener("click", () => {
  if (!els.bodyExplorer) return;
  els.bodyExplorer.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  els.dropZone.classList.add("dragging");
});
els.dropZone.addEventListener("dragleave", () => els.dropZone.classList.remove("dragging"));
els.dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  els.dropZone.classList.remove("dragging");
  handleFile(event.dataTransfer.files[0]);
});

els.inbodyDropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  els.inbodyDropZone.classList.add("dragging");
});
els.inbodyDropZone.addEventListener("dragleave", () => els.inbodyDropZone.classList.remove("dragging"));
els.inbodyDropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  els.inbodyDropZone.classList.remove("dragging");
  handleInBodyFile(event.dataTransfer.files[0]);
});

let swipeStartX = null;
let swipeStartY = null;
els.pageViewport.addEventListener(
  "touchstart",
  (event) => {
    const touch = event.touches[0];
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
  },
  { passive: true }
);
els.pageViewport.addEventListener(
  "touchend",
  (event) => {
    if (swipeStartX === null || swipeStartY === null) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipeStartX;
    const dy = touch.clientY - swipeStartY;
    swipeStartX = null;
    swipeStartY = null;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    setPage(dx < 0 ? "inbody" : "training");
  },
  { passive: true }
);

function bindChartTooltip(canvas, pointKey) {
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const stackRect = els.trendPanel.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const points = state.chartPoints[pointKey] || [];
    const nearest = points
      .map((point) => ({ point, distance: Math.hypot(point.x - x, point.y - y) }))
      .sort((a, b) => a.distance - b.distance)[0];
    const threshold = pointKey === "bubble" ? Math.max(26, (nearest?.point?.radius || 0) + 8) : 24;
    if (!nearest || nearest.distance > threshold) {
      els.chartTooltip.hidden = true;
      return;
    }
    els.chartTooltip.hidden = false;
    els.chartTooltip.innerHTML = buildTrendTooltip(nearest.point);
    els.chartTooltip.style.left = `${event.clientX - stackRect.left}px`;
    els.chartTooltip.style.top = `${event.clientY - stackRect.top}px`;
  });
  canvas.addEventListener("mouseleave", () => {
    els.chartTooltip.hidden = true;
  });
}

bindChartTooltip(els.scoreCanvas, "score");
bindChartTooltip(els.bubbleCanvas, "mainReps");
bindChartTooltip(els.repsCanvas, "mainWeight");

els.inbodyCanvas.addEventListener("mousemove", (event) => {
  const rect = els.inbodyCanvas.getBoundingClientRect();
  const panelRect = document.querySelector(".inbody-panel").getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const nearest = state.inbodyPoints
    .map((point) => ({ point, distance: Math.hypot(point.x - x, point.y - y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (!nearest || nearest.distance > 24) {
    els.inbodyTooltip.hidden = true;
    return;
  }
  els.inbodyTooltip.hidden = false;
  els.inbodyTooltip.innerHTML = buildInBodyTooltip(nearest.point);
  els.inbodyTooltip.style.left = `${event.clientX - panelRect.left}px`;
  els.inbodyTooltip.style.top = `${event.clientY - panelRect.top}px`;
});
els.inbodyCanvas.addEventListener("mouseleave", () => {
  els.inbodyTooltip.hidden = true;
});

window.addEventListener("resize", () => renderAll());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

loadSample().catch((error) => {
  els.summaryGrid.innerHTML = `<article class="kpi-card"><div class="kpi-label">Error</div><div class="kpi-value">CSV</div><div class="kpi-sub">${escapeHtml(error.message)}</div></article>`;
});
