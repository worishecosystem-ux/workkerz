import { BriefcaseBusiness, MapPin, Phone, User, Wrench } from "lucide-react";
import InputField from "../fields/InputField";

type BasicInformationSectionProps = {
  name: string;
  phone: string;
  category: string;
  subcategory: string;
  specialty: string;
  location: string;
  labourChauk: string;
  setName: (value: string) => void;
  setPhone: (value: string) => void;
  setCategory: (value: string) => void;
  setSubcategory: (value: string) => void;
  setSpecialty: (value: string) => void;
  setLocation: (value: string) => void;
  setLabourChauk: (value: string) => void;
};

export default function BasicInformationSection({
  name,
  phone,
  category,
  subcategory,
  specialty,
  location,
  labourChauk,
  setName,
  setPhone,
  setCategory,
  setSubcategory,
  setSpecialty,
  setLocation,
  setLabourChauk,
}: BasicInformationSectionProps) {
  return (
    <FormSection title="Basic Information" icon={User}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <InputField
          label="Worker Name"
          icon={User}
          value={name}
          onChange={setName}
          placeholder="Enter worker name"
          required
        />

        <InputField
          label="Phone"
          icon={Phone}
          value={phone}
          onChange={(value) => setPhone(value.replace(/\D/g, "").slice(0, 10))}
          placeholder="10 digit mobile number"
          required
          inputMode="numeric"
        />

        <InputField
          label="Category"
          icon={BriefcaseBusiness}
          value={category}
          onChange={setCategory}
          placeholder="e.g. Labour"
          required
        />

        <InputField
          label="Subcategory"
          icon={BriefcaseBusiness}
          value={subcategory}
          onChange={setSubcategory}
          placeholder="e.g. General Labour"
          required
        />

        <InputField
          label="Specialty"
          icon={Wrench}
          value={specialty}
          onChange={setSpecialty}
          placeholder="e.g. Brick Mason"
          required
        />

        <InputField
          label="Location"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          placeholder="Enter location"
          required
        />

        <InputField
          label="Labour Chauk"
          icon={MapPin}
          value={labourChauk}
          onChange={setLabourChauk}
          placeholder="Enter labour chauk"
        />
      </div>
    </FormSection>
  );
}

type FormSectionProps = {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
};

function FormSection({
  title,
  icon: Icon,
  children,
}: FormSectionProps) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
          <Icon className="h-3.5 w-3.5 text-[#FF5C39]" />
        </div>

        <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}