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

const DEFAULT_CSV_PATH = "./data/sample.csv";
const DEFAULT_CSV_NAME = "サンプルデータ";
const STORED_CSV_KEY = "workout-review.csvText.v1";
const STORED_CSV_NAME_KEY = "workout-review.csvName.v1";

const state = {
  workouts: [],
  fileName: DEFAULT_CSV_NAME,
  range: "all",
  body: "all",
  exercise: "",
  metric: "mainWork",
  search: "",
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

function parseDelimitedLine(line) {
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
    } else if (char === ";" && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).replace(",", ".");
  const parsed = Number(normalized);
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
  renderSummary(rangeWorkouts);
  renderBodyTabs(rangeWorkouts);
  renderExerciseCards(rangeWorkouts);
  renderBodySummary(rangeWorkouts);
  renderTrend(rangeWorkouts);
  renderWeekly(rangeWorkouts);
  renderInsights(rangeWorkouts);
  renderExerciseTable(rangeWorkouts);
  renderTimeline(rangeWorkouts);
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
  const cardioRecords = records.filter((record) => record.type === "cardio");
  const totalVolume = sum(workouts.map((workout) => workout.metrics), "volumeKg");
  const totalSets = sum(strengthRecords.map((record) => record.metrics), "sets");
  const dateRange = getDateRangeLabel(workouts);
  const topExercise = buildExerciseStats(workouts).find((stat) => stat.type === "strength");
  const cardioMinutes = sum(cardioRecords.map((record) => record.metrics), "timeSec") / 60;

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
    },
    {
      label: "最多種目",
      value: topExercise ? truncate(topExercise.name, 16) : "なし",
      sub: topExercise
        ? `${topExercise.body} / ${numberFmt.format(topExercise.sessions)}回 / ${formatTon(topExercise.volumeKg)}`
        : cardioMinutes
          ? `有酸素 ${numberFmt.format(cardioMinutes)}分`
          : "CSVを読み込めませんでした"
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

function renderBodySummary(workouts) {
  const stats = new Map();
  flattenExercises(workouts).forEach((record) => {
    const item = stats.get(record.body) || {
      body: record.body,
      sessions: new Set(),
      sets: 0,
      reps: 0,
      volumeKg: 0,
      timeSec: 0,
      distanceM: 0,
      exercises: new Map()
    };
    item.sessions.add(record.workout.id);
    item.sets += record.metrics.sets;
    item.reps += record.metrics.reps;
    item.volumeKg += record.metrics.volumeKg;
    item.timeSec += record.metrics.timeSec;
    item.distanceM += record.metrics.distanceM;
    item.exercises.set(record.name, (item.exercises.get(record.name) || 0) + 1);
    stats.set(record.body, item);
  });

  const items = BODY_ORDER.map((body) => stats.get(body)).filter(Boolean);
  const maxMetric = Math.max(
    1,
    ...items.map((item) => (item.body === "有酸素" ? item.timeSec / 60 : item.volumeKg))
  );
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
                            ${renderMainSetBars(detail.points, detail.color, detail.scaleMax, "main-set-bars detail", {
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

  const bodyCardsMarkup = items
    .map((item) => {
      const metric = item.body === "有酸素" ? item.timeSec / 60 : item.volumeKg;
      const top = [...item.exercises.entries()].sort((a, b) => b[1] - a[1])[0];
      const value =
        item.body === "有酸素"
          ? `${numberFmt.format(metric)}分`
          : `${formatTon(item.volumeKg)} / ${numberFmt.format(item.sets)}セット`;
      return `
        <div class="body-card">
          <div>
            <div class="body-name">${escapeHtml(item.body)}</div>
            <div class="body-top">${top ? escapeHtml(top[0]) : ""}</div>
          </div>
          <div class="meter" aria-hidden="true">
            <span style="width:${Math.max(3, (metric / maxMetric) * 100)}%; background:${BODY_COLORS[item.body]};"></span>
          </div>
          <div class="body-meta">${escapeHtml(value)}</div>
        </div>
      `;
    })
    .join("");

  els.bodySummary.innerHTML = `${rollingMarkup}${bodyCardsMarkup}`;
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
      .filter((exercise) => exercise.type === "strength" && bodySet.has(exercise.body))
      .forEach((exercise) => {
        const mainSetCount = exercise.metrics.mainSetCount || 0;
        const detail = classifyMuscleDetail(exercise.name);
        item.bodies[exercise.body] += mainSetCount;
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
  const reader = new FileReader();
  reader.addEventListener("load", () => loadCsv(String(reader.result || ""), file.name, { persist: true }));
  reader.readAsText(file, "utf-8");
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
els.rangeSelect.addEventListener("change", (event) => {
  state.range = event.target.value;
  renderAll();
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

window.addEventListener("resize", () => renderAll());

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

loadSample().catch((error) => {
  els.summaryGrid.innerHTML = `<article class="kpi-card"><div class="kpi-label">Error</div><div class="kpi-value">CSV</div><div class="kpi-sub">${escapeHtml(error.message)}</div></article>`;
});
