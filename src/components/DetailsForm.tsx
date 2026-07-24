import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, User, ArrowRight, CheckCircle2, AlertCircle, Loader2, CheckSquare, Square, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BirthTimeAccuracy, UserInputProfile, GeocodedLocation } from '../types';
import { getApiUrl } from '../utils/api';

interface DetailsFormProps {
  initialValues?: Partial<UserInputProfile>;
  onSubmit: (data: UserInputProfile, skipQuestionnaire?: boolean) => void;
}

export const DetailsForm: React.FC<DetailsFormProps> = ({ initialValues, onSubmit }) => {
  const [fullName, setFullName] = useState(initialValues?.fullName || '');
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate || '');
  const [birthTime, setBirthTime] = useState(initialValues?.birthTime || '');
  const [birthTimeAccuracy, setBirthTimeAccuracy] = useState<BirthTimeAccuracy>(
    initialValues?.birthTimeAccuracy || 'unknown'
  );
  const [birthPlace, setBirthPlace] = useState(initialValues?.birthPlace || '');
  const [consentAccepted, setConsentAccepted] = useState(true);

  // Autocomplete state
  const [placeQuery, setPlaceQuery] = useState(birthPlace);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestedLocation, setSuggestedLocation] = useState<GeocodedLocation | null>(null);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Debounced geocoding lookup
  useEffect(() => {
    if (!placeQuery || placeQuery.trim().length < 3) {
      setSuggestedLocation(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const res = await fetch(getApiUrl('/api/geocode'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ place: placeQuery }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setSuggestedLocation(data.data);
        }
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setIsGeocoding(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [placeQuery]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errs.fullName = 'Full name is required (at least 2 characters)';
    }

    if (!birthDate) {
      errs.birthDate = 'Date of birth is required';
    } else {
      const year = parseInt(birthDate.split('-')[0], 10);
      if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
        errs.birthDate = 'Please enter a valid birth year';
      }
    }

    if (!birthPlace.trim()) {
      errs.birthPlace = 'Birthplace is required';
    }

    if (!consentAccepted) {
      errs.consent = 'Please accept consent to proceed with analysis';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (skipQuestionnaire = true) => {
    if (!validate()) return;

    const payload: UserInputProfile = {
      fullName: fullName.trim(),
      birthDate,
      birthTime: birthTimeAccuracy === 'unknown' ? undefined : birthTime,
      birthTimeAccuracy,
      birthPlace: suggestedLocation ? suggestedLocation.formattedName : birthPlace.trim(),
      city: suggestedLocation?.city,
      region: suggestedLocation?.region,
      country: suggestedLocation?.country,
      latitude: suggestedLocation?.latitude,
      longitude: suggestedLocation?.longitude,
      timezone: suggestedLocation?.timezone,
    };

    onSubmit(payload, skipQuestionnaire);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-600" />
            <span>Birth Details</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Provide your birth parameters for precise ephemeris and numerical matrix calculation.
          </p>
        </div>

        <div className="space-y-5 text-sm">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">
              Full Name <span className="text-neutral-400 font-normal">(as given at birth)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                }}
                placeholder="Enter full name"
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.fullName}</span>
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  if (errors.birthDate) setErrors((p) => ({ ...p, birthDate: '' }));
                }}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
              />
            </div>
            {errors.birthDate && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.birthDate}</span>
              </p>
            )}
          </div>

          {/* Birth Time & Accuracy */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-neutral-700">
              Birth Time Confidence
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['exact', 'approximate', 'unknown'] as BirthTimeAccuracy[]).map((acc) => (
                <button
                  key={acc}
                  type="button"
                  onClick={() => {
                    setBirthTimeAccuracy(acc);
                    if (acc === 'unknown') setBirthTime('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center capitalize transition-all cursor-pointer ${
                    birthTimeAccuracy === acc
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-xs'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>

            {birthTimeAccuracy !== 'unknown' && (
              <div className="pt-2">
                <label className="block text-xs text-neutral-500 mb-1">
                  {birthTimeAccuracy === 'exact' ? 'Exact Time' : 'Approximate Time'}
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="time"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
              </div>
            )}
            {birthTimeAccuracy === 'unknown' && (
              <p className="text-[11px] text-neutral-500 pt-1">
                Calculations safely omit time-sensitive house divisions without estimating data.
              </p>
            )}
          </div>

          {/* Birth Place */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-neutral-700">
              Birthplace <span className="text-neutral-400 font-normal">(City, Country)</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={placeQuery}
                onChange={(e) => {
                  setPlaceQuery(e.target.value);
                  setBirthPlace(e.target.value);
                  if (errors.birthPlace) setErrors((p) => ({ ...p, birthPlace: '' }));
                }}
                placeholder="e.g. Mumbai, India or London, UK"
                className="w-full pl-9 pr-9 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 text-sm transition-all"
              />
              {isGeocoding && (
                <Loader2 className="w-4 h-4 text-sky-600 animate-spin absolute right-3 top-2.5" />
              )}
            </div>

            {suggestedLocation && (
              <div className="mt-1.5 p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-medium">{suggestedLocation.formattedName}</span>
                </div>
                <span className="text-neutral-500 font-mono text-[10px]">
                  {suggestedLocation.latitude.toFixed(2)}°, {suggestedLocation.longitude.toFixed(2)}°
                </span>
              </div>
            )}

            {errors.birthPlace && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.birthPlace}</span>
              </p>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setConsentAccepted(!consentAccepted);
                if (errors.consent) setErrors((p) => ({ ...p, consent: '' }));
              }}
              className="flex items-center gap-2.5 text-left text-xs text-neutral-700 hover:text-neutral-900 cursor-pointer group"
            >
              {consentAccepted ? (
                <CheckSquare className="w-4 h-4 text-sky-600 shrink-0" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-600" />
              )}
              <span>
                I consent to calculating my birth parameters for my personal psychological profile.
              </span>
            </button>
            {errors.consent && (
              <p className="text-xs text-red-600 flex items-center gap-1 mt-1 pl-6">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.consent}</span>
              </p>
            )}
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-3 px-5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            <span>Analyze Directly</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Add Behavioral Patterns (Optional)
          </button>
        </div>
      </div>
    </motion.div>
  );
};
